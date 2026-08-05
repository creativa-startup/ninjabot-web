/**
 * @module postService
 * @description Servicio de posts sociales con Supabase.
 * Módulo puro TypeScript en src/services/ — sin dependencias React.
 * Mapea la tabla: posts (Fase 1 — Persistencia de publicaciones).
 *
 * Relaciones:
 *   profiles 1:N posts (cada post pertenece a un perfil de usuario)
 *   connections N:N profiles (grafo social User-to-User para visibilidad)
 */

import { supabase } from './supabase';

// ──────────────────────────────────────────────
// Tipos de BD (mapeo columnas DB -> SocialPost)
// ──────────────────────────────────────────────

export interface DBPost {
  id: string;
  user_id: string;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  content: string;
  channel: string;
  metrics: {
    comments: number;
    likes: number;
    shares: number;
  } | null;
  is_online: boolean | null;
  created_at: string;
  /** URL de la imagen adjunta al post (opcional) */
  media_url?: string | null;
}

export interface DBPostWithAuthor extends DBPost {
  /** JOIN: perfil del autor (via select('*, author:profiles(...)')) */
  author?: {
    id: string;
    email?: string | null;
    full_name?: string | null;
    handle?: string | null;
  } | null;
}

// ──────────────────────────────────────────────
// Mappers DB -> types.ts
// ──────────────────────────────────────────────

function mapPost(db: DBPostWithAuthor): import('../features/chats/types').SocialPost {
  const identitySource = db.author || null;

  return {
    id: db.id,
    authorName:
      identitySource?.full_name ||
      db.author_name ||
      'Usuario Ninjabot',
    authorHandle: db.author_handle || `@${(identitySource?.full_name || 'usuario').toLowerCase().replace(/\s+/g, '.')}`,
    authorAvatar: db.author_avatar || (identitySource?.email ? identitySource.email[0].toUpperCase() : 'NU'),
    content: db.content,
    timestamp: db.created_at,
    channel: (db.channel as 'facebook' | 'twitter' | 'instagram' | 'linkedin') || 'instagram',
    metrics: {
      comments: db.metrics?.comments ?? 0,
      likes: db.metrics?.likes ?? 0,
      shares: db.metrics?.shares ?? 0,
    },
    isOnline: db.is_online ?? true,
    // Identidad Única: handle real del perfil del autor (sin @) para /@handle
    handle: identitySource?.handle || db.author_handle?.replace(/^@/, '') || undefined,
    userId: db.user_id,
    media_url: db.media_url || undefined,
  };
}

// ──────────────────────────────────────────────
// Servicios de consulta
// ──────────────────────────────────────────────

/**
 * Obtiene los posts visibles para el usuario autenticado.
 *
 * RLS aplica la política de visibilidad:
 *   - Posts propios (user_id = auth.uid())
 *   - Posts de usuarios con los que existe una conexión aceptada
 *
 * El JOIN con profiles trae la identidad actualizada del autor.
 */
export async function fetchPosts(): Promise<import('../features/chats/types').SocialPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, email, full_name, handle)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPost);
}

/**
 * Obtiene los posts de un usuario específico (público tras conexión aceptada).
 */
export async function fetchPostsByUser(userId: string): Promise<import('../features/chats/types').SocialPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, email, full_name, handle)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPost);
}

// ──────────────────────────────────────────────
// Operaciones de escritura (mutaciones)
// ──────────────────────────────────────────────

/** Payload para la creación de un nuevo post (publicación en el feed) */
export interface CreatePostInput {
  /** Contenido textual del post */
  content: string;
  /** Canal de publicación (opcional — default 'instagram') */
  channel?: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  /** URL de la imagen adjunta al post (opcional — UI only, aún sin columna en BD) */
  media_url?: string;
}

/**
 * Crea un post en Supabase para el usuario autenticado.
 *
 * Resuelve la identidad del autor desde el perfil del usuario (profiles)
 * para poblar author_name, author_handle y author_avatar reales.
 * Devuelve el SocialPost persistido mapeado con mapPost.
 *
 * RLS: la política posts_insert_own garantiza que solo el usuario
 * autenticado puede insertar posts con su propio user_id.
 */
export async function createPost(input: CreatePostInput): Promise<import('../features/chats/types').SocialPost> {
  // 1. Obtener usuario autenticado (RLS exige user_id = auth.uid())
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('[createPost] No hay usuario autenticado');

  // 2. Obtener perfil del autor para la identidad visible (author_*)
  const { data: perfil } = await supabase
    .from('profiles')
    .select('full_name, handle, email')
    .eq('id', user.id)
    .maybeSingle();

  const authorName = perfil?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario Ninjabot';
  const authorHandle = perfil?.handle
    ? `@${perfil.handle}`
    : `@${(authorName || 'usuario').toLowerCase().replace(/\s+/g, '.')}`;
  const authorAvatar = (perfil?.email || user.email || 'NU')[0].toUpperCase();

  // 3. Insertar el post con la identidad resuelta
  // NOTA: media_url es un campo de UI (SocialPost.media_url) que aún no
  // existe como columna en la tabla posts — se omite del INSERT para no
  // romper con Supabase/PostgREST (columnas inexistentes → error 400).
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      author_name: authorName,
      author_handle: authorHandle,
      author_avatar: authorAvatar,
      content: input.content,
      channel: input.channel || 'instagram',
    })
    .select('*, author:profiles(id, email, full_name, handle)')
    .single();

  if (error) throw error;
  return mapPost(data);
}

/**
 * Actualiza los métricas de un post (likes/comments/shares).
 */
export async function updatePostMetrics(
  postId: string,
  metrics: Partial<{ comments: number; likes: number; shares: number }>,
): Promise<void> {
  // Leer métricas actuales para hacer incrementos correctos
  const { data: current, error: readError } = await supabase
    .from('posts')
    .select('metrics')
    .eq('id', postId)
    .maybeSingle();

  if (readError) throw readError;

  const base = current?.metrics || { comments: 0, likes: 0, shares: 0 };
  const { error } = await supabase
    .from('posts')
    .update({
      metrics: {
        comments: metrics.comments ?? base.comments,
        likes: metrics.likes ?? base.likes,
        shares: metrics.shares ?? base.shares,
      },
    })
    .eq('id', postId);

  if (error) throw error;
}

/**
 * Elimina un post (solo el autor puede eliminarlo — RLS lo garantiza).
 */
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}