/**
 * @module usePostsFeed
 * @description Hook puro de gestión del feed de publicaciones (SocialPost).
 * Encapsula la lógica de carga, publicación optimista (0 ms de latencia),
 * filtrado por hashtag activo y recarga manual. Aislado del orquestador
 * ChatsFeature para mantener los paneles N2/N3 limpios y puros.
 *
 * Estados administrados:
 *   - localPosts:   SocialPost[] cargados en memoria.
 *   - activeHashtag: string | null — filtro por hashtag activo.
 *   - isLoading:    boolean — estado de carga contra Supabase.
 *   - error:        string | null — mensajes de error de conexión/red.
 *
 * Publicación optimista:
 *   1. Genera un post temporal con ID `temp-{timestamp}` y isPending: true.
 *   2. Lo agrega al inicio de localPosts de inmediato.
 *   3. Dispara postService.createPost.
 *   4. Éxito → reemplaza el temporal por el registro real (isPending: false).
 *   5. Falla  → rollback (remueve el temporal) y re-propaga el error para
 *      que la UI o un toast lo notifique de manera no bloqueante.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SocialPost } from '../types';
import { fetchPosts as fetchPostsService, createPost, type CreatePostInput } from '../../../services/postService';

// ──────────────────────────────────────────────
// Tipos públicos del hook
// ──────────────────────────────────────────────

export interface UsePostsFeedOptions {
  /** Posts iniciales (props externas en modo sandbox) */
  initialPosts?: SocialPost[];
  /** Si false, no carga desde la BD (modo sandbox sin autenticación) */
  enabled?: boolean;
}

/** Payload del formulario de creación de post (ControlCreatePost) */
export interface CreatePostPayload {
  text: string;
  media: Array<{ type: 'photo' | 'video'; name: string }>;
}

/**
 * Mapeo defensivo: unifica el modelo de datos de Supabase
 * (created_at, objeto author anidado) con la interfaz SocialPost.
 *
 * Si el registro ya es un SocialPost completo (tiene timestamp y metrics),
 * se usa tal cual. Si viene crudo de Supabase, se normaliza.
 */
function toSocialPost(raw: SocialPost | Record<string, unknown>): SocialPost {
  // Caso 1: ya es un SocialPost completo
  if ('timestamp' in raw && 'metrics' in raw && 'authorName' in raw) {
    return raw as SocialPost;
  }

  // Caso 2: fila cruda de Supabase (created_at + objeto author anidado)
  const db = raw as Record<string, unknown> & {
    id?: string;
    created_at?: string;
    author_name?: string;
    author_handle?: string;
    author_avatar?: string;
    content?: string;
    channel?: string;
    metrics?: { comments?: number; likes?: number; shares?: number } | null;
    is_online?: boolean | null;
    user_id?: string;
    author?: { id?: string; email?: string | null; full_name?: string | null; handle?: string | null } | null;
    media_url?: string | null;
  };

  const identity = db.author || null;
  const fullName = identity?.full_name || db.author_name || 'Usuario Ninjabot';

  return {
    id: db.id || `raw-${Date.now()}`,
    authorName: fullName,
    authorHandle:
      db.author_handle ||
      `@${(identity?.handle || fullName || 'usuario').toLowerCase().replace(/\s+/g, '.')}`,
    authorAvatar:
      db.author_avatar ||
      (identity?.email ? identity.email[0].toUpperCase() : fullName.charAt(0).toUpperCase()),
    content: db.content || '',
    timestamp: db.created_at || new Date().toISOString(),
    channel: (db.channel as SocialPost['channel']) || 'instagram',
    metrics: {
      comments: db.metrics?.comments ?? 0,
      likes: db.metrics?.likes ?? 0,
      shares: db.metrics?.shares ?? 0,
    },
    isOnline: db.is_online ?? true,
    handle: identity?.handle || db.author_handle?.replace(/^@/, '') || undefined,
    userId: db.user_id,
    media_url: db.media_url || undefined,
  };
}

/**
 * Hook puro del feed de posts.
 *
 * @param searchQuery - Término de búsqueda (del hook de navegación).
 * @param options - Configuración opcional (posts iniciales, enable).
 * @returns Estado y callbacks del feed.
 */
export function usePostsFeed(
  searchQuery: string,
  options: UsePostsFeedOptions = {},
) {
  const { initialPosts = [], enabled = true } = options;

  // ── Estados ──
  const [localPosts, setLocalPosts] = useState<SocialPost[]>(initialPosts);
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * fetchPosts — Carga los posts desde Supabase aplicando mapeo defensivo.
   * Expuesta internamente y utilizada por handleRefreshFeed.
   */
  const fetchPosts = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const rawPosts = await fetchPostsService();
      const mappedPosts = rawPosts.map(toSocialPost);
      setLocalPosts(mappedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión al cargar publicaciones');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Carga inicial al montar
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /**
   * handleCreatePost — Inserción optimista a 0 ms de latencia.
   * - Crea un post temporal con ID `temp-{timestamp}` y isPending: true.
   * - Lo agrega al inicio de localPosts de inmediato.
   * - Dispara la llamada asíncrona a postService.createPost.
   * - Éxito: reemplaza el temporal buscando por su ID con el registro real.
   * - Falla: rollback (remueve el temporal) y re-propaga el error.
   */
  const handleCreatePost = useCallback(async (payload: CreatePostPayload) => {
    const text = payload.text?.trim();
    if (!text) return;

    // 1. Generar post temporal (optimista — 0 ms de latencia)
    const tempId = `temp-${Date.now()}`;
    const tempPost: SocialPost = {
      id: tempId,
      authorName: 'Tú',
      authorHandle: '@tu',
      authorAvatar: 'T',
      content: text,
      timestamp: new Date().toISOString(),
      channel: 'instagram',
      metrics: { comments: 0, likes: 0, shares: 0 },
      isOnline: true,
      isPending: true,
      media_url: payload.media?.length ? payload.media[0].name : undefined,
    };

    // 2. Insertar temporal al inicio del feed (sin esperar a la BD)
    setLocalPosts((prev) => [tempPost, ...prev]);

    try {
      // 3. Persistir en la BD
      const created = await createPost({
        content: text,
        channel: 'instagram',
        media_url: tempPost.media_url,
      } satisfies CreatePostInput);

      // 4. Éxito: reemplazar el temporal por el registro real
      setLocalPosts((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? { ...created, isPending: false }
            : p
        )
      );
    } catch (err) {
      // 5. Falla: rollback — remover el temporal y propagar el error
      setLocalPosts((prev) => prev.filter((p) => p.id !== tempId));
      throw err;
    }
  }, []);

  /**
   * handleRefreshFeed — Recarga manual del feed.
   */
  const handleRefreshFeed = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  /**
   * posts — Array filtrado en base a:
   *  - activeHashtag: si hay un hashtag seleccionado, filtra los posts
   *    que incluyan ese hashtag en su contenido.
   *  - searchQuery: si existe un término de búsqueda, filtra si el contenido
   *    del post o el nombre/handle del autor coinciden con el query.
   */
  const posts = useMemo(() => {
    let result = localPosts;

    // Filtro por hashtag activo
    if (activeHashtag) {
      const tag = activeHashtag.toLowerCase();
      result = result.filter((p) =>
        p.content.toLowerCase().includes(tag)
      );
    }

    // Filtro por búsqueda textual (contenido o autor)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.authorHandle.toLowerCase().includes(q)
      );
    }

    return result;
  }, [localPosts, activeHashtag, searchQuery]);

  return {
    /** Posts filtrados por hashtag activo y/o searchQuery */
    posts,
    /** Hashtag activo (null = todas las publicaciones) */
    activeHashtag,
    /** Setter del hashtag activo */
    setActiveHashtag,
    /** Estado de carga de la base de datos */
    isLoading,
    /** Mensaje de error de conexión/red */
    error,
    /** Publicación optimista + persistencia en BD */
    handleCreatePost,
    /** Recarga manual del feed */
    handleRefreshFeed,
  };
}

export default usePostsFeed;