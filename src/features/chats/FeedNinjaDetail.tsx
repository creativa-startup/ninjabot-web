/**
 * @module FeedNinjaDetail
 * @description Panel de layout del feed Ninja (N3) — Social Commerce limpio y enfocado.
 * Componente [Panel] presentacional puro: reemplaza el 100% del espacio
 * del detalle N3 cuando el modo Feed Ninja está activo.
 *
 * Rediseño Ultra-Minimalista B/N:
 *   - Contenedor raíz con scroll interno.
 *   - Contenido envuelto en div central con ancho acotado de lectura
 *     (max-w-2xl w-full px-4 py-6 flex flex-col gap-6).
 *
 * Orden interno (Secciones):
 *   1. Título "Los Jazs" — encabezado tipográfico elegante.
 *   2. Stories Reel — scroll horizontal con burbujas de historia usando
 *      el componente atómico <Avatar size="xl" /> con anillo de degradado.
 *   3. ControlCreatePost — creación de posts inmediatamente debajo del reel.
 *   4. PostFeedCard — renders secuenciales de los posts filtrados por props.
 *
 * DRY (Don't Repeat Yourself):
 *   Reemplaza el antiguo CreatePostForm por el componente atómico premium
 *   ControlCreatePost (src/components/ui/), unificando la creación de
 *   publicaciones en toda la plataforma.
 *
 * Estilo visual:
 *   - Fondo 100% transparente: hereda el token --panel-n3 (#141414)
 *     de la raíz ChatN3DetailPanel para que la tarjeta ControlCreatePost
 *     (dark) resalte con su border-white/10 y backdrop-blur.
 *   - Sin bordes ni cajas: los elementos flotan en el espacio libre
 *     conservando el ancho central (max-w-2xl).
 */

import React, { useState } from 'react';
import type { SocialPost } from './types';
import { NinjabotLogo } from '../../components/common/NinjabotLogo';
import { PostFeedCard } from './PostFeedCard';
import { ControlCreatePost } from '../../components/ui/ControlCreatePost';
import { Avatar } from '../../components/ui/Avatar';

export interface FeedNinjaDetailProps {
  /** Posts a renderizar en el feed (ya filtrados por hashtag) */
  posts?: SocialPost[];
  /** Hashtag activo seleccionado (null = todas las publicaciones) */
  activeHashtag?: string | null;
  /** Callback al hacer clic en el autor de un post → navegación a /@handle */
  onAuthorClick?: (post: SocialPost) => void;
  /** Callback al presionar el link "feed" (actualizar/recargar feed) */
  onRefreshFeed?: () => void;
  /** Callback al publicar un post desde ControlCreatePost → delega al orquestador */
  onCreatePost?: (payload: { text: string; media: Array<{ type: 'photo' | 'video'; name: string }> }) => void;
}

/** Story derivada de un SocialPost para el Stories Reel */
interface StoryBubble {
  key: string;
  name: string;
  avatar: string;
  online: boolean;
}

/** Anillo degradado del Stories Reel — patrón de composición estático */
const STORY_RING_CLASSES =
  'p-[2px] rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500';

export const FeedNinjaDetail: React.FC<FeedNinjaDetailProps> = ({
  posts = [],
  activeHashtag = null,
  onAuthorClick,
  onRefreshFeed: _onRefreshFeed,
  onCreatePost,
}) => {
  /* ControlCreatePost abierto por defecto — el feed principal siempre ofrece
     el formulario premium de publicación visible (DRY: componente atómico UI). */
  const [isPublishOpen, setIsPublishOpen] = useState(true);

  /* Delega la publicación al orquestador padre (hook usePostsFeed) — el
     hook aplica inserción optimista con rollback ante errores de red. */
  const handleCreatePost = (payload: { text: string; media: Array<{ type: 'photo' | 'video'; name: string }> }) => {
    onCreatePost?.(payload);
  };

  /* Stories Reel — deriva burbujas de historias desde los posts del feed.
     Usa el avatar del autor (fallback a inicial) + estado online. */
  const stories: StoryBubble[] = posts.slice(0, 8).map((post) => {
    const avatarUrl = post.authorAvatar && post.authorAvatar.startsWith('http')
      ? post.authorAvatar
      : '';
    return {
      key: post.id,
      name: post.authorName || 'N',
      avatar: avatarUrl,
      online: post.isOnline ?? false,
    };
  });

  return (
    <div className="flex-1 bg-transparent h-full overflow-y-auto flex flex-col">
      {/* Cabecera fija: logo Ninjabot + hashtag activo (fondo del panel N3) */}
      <header className="p-4 bg-[#141414]/70 backdrop-blur-md sticky top-0 z-10 shrink-0 flex items-center gap-3">
        <NinjabotLogo size="sm" />
        <h1 className="font-bold text-lg text-white">Ninjas</h1>
        {activeHashtag && (
          <span className="text-sm text-gray-400 font-medium ml-auto">
            #{activeHashtag}
          </span>
        )}
      </header>

      {/* Columna central — ancho acotado de lectura (max-w-2xl alineado a la izquierda) */}
      <div className="w-full max-w-2xl px-4 py-6 flex flex-col gap-6">
        {/* ═══ Sección 1: Título "Los Jazs" ═══ */}
        <h1 className="text-2xl font-semibold text-title tracking-tight">
          Los Jazs
        </h1>

        {/* ═══ Sección 2: Stories Reel (Historias) ═══ */}
        <section aria-label="Historias">
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {stories.length === 0 ? (
              <span className="text-xs text-secondary/60 leading-relaxed font-light">
                Sin historias disponibles — sé el primero en publicar.
              </span>
            ) : (
              stories.map((story) => (
                <button
                  key={story.key}
                  type="button"
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16 cursor-pointer active:scale-95 transition-transform"
                  title={`Ver historia de ${story.name}`}
                >
                  {/* Patrón de composición: anillo degradado + Avatar size="xl" */}
                  <span className={STORY_RING_CLASSES}>
                    <Avatar
                      src={story.avatar || undefined}
                      fallback={story.name.charAt(0).toUpperCase()}
                      size="xl"
                      className="border-4 border-transparent"
                    />
                  </span>
                  <span className="text-[10px] truncate w-full text-center text-gray-400/80">
                    {story.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        {/* ═══ Sección 3: Crear Post (ControlCreatePost) ═══ */}
        <div className="shrink-0">
          <ControlCreatePost
            isOpen={isPublishOpen}
            onClose={() => setIsPublishOpen(false)}
            onSubmit={handleCreatePost}
            isShellDark={true}
            jazs={450}
          />
        </div>

        {/* ═══ Sección 4: Listado de Posts (PostFeedCard) ═══ */}
        <div className="flex flex-col">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-400">
                {activeHashtag
                  ? `No hay publicaciones para #${activeHashtag}`
                  : 'No hay publicaciones aún'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activeHashtag
                  ? 'Intenta con otra tendencia'
                  : 'Sé el primero en publicar'}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostFeedCard
                key={post.id}
                post={post}
                variant="dark"
                onReply={() => {
                  /* Por ahora sin lógica (sin llamadas a BD) */
                }}
                onAuthorClick={onAuthorClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedNinjaDetail;