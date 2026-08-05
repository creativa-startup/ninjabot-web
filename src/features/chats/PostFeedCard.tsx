/**
 * @module PostFeedCard
 * @description Tarjeta de post social tipo RRSS para el feed del panel N2.
 * Componente [Detail/Item] memoizado: avatar, nombre de autor, @handle,
 * timestamp relativo, contenido del post, métricas abstractas gamificadas
 * e imagen opcional.
 *
 * Sistema de Diseño — Capa 1 (Tokens y Superficies):
 * - Superficies: glass-card-light / glass-card-dark (contenedor principal).
 * - Jerarquía tipográfica: text-title (autor), text-meta (@handle/timestamp),
 *   text-body (contenido), text-caption (metadatos).
 * - Microinteracciones: hover-lift (elevación suave) y active-press (compresión
 *   táctil en botones del footer).
 * - Regla estricta: sin redundancias de bg-, border-, shadow- ni opacidades de
 *   texto — todo delegado a la Capa 1 inyectada en src/index.css.
 *
 * Layout Edge-to-Edge (Imagen a Sangre):
 * - El contenedor principal NO aplica padding global; el padding se distribuye
 *   por secciones: cabecera (px-4 pt-4), contenido/footer (px-4 pb-4).
 * - La imagen ocupa el 100% del ancho de la tarjeta, tocando exactamente
 *   los bordes izquierdo y derecho (full-bleed).
 * - Sin clases de redondeo (rounded-none global vía Capa 1).
 *
 * Timeline Visual-First (Panel N2):
 * - isTimelineView (default true): si el post tiene imagen, el texto se
 *   oculta por defecto priorizando lo visual. Al hacer clic en la imagen
 *   o en el link "Ver más" bajo el nombre del usuario, se revela el texto.
 * - Badge de entidad (red social) + punto verde de estado activo integrados
 *   sobre el avatar del autor, respetando la materialidad flotante.
 * - La entidad se muestra ÚNICAMENTE sobre el avatar (sin duplicados en el
 *   header de la tarjeta).
 *
 * Comentarios Light (Efecto Lienzo):
 * - Sin cajas, fondos, bordes ni burbujas en los comentarios individuales.
 * - Los comentarios fluyen sobre el lienzo de la tarjeta, separados solo
 *   por espacio en blanco (gap-4) y jerarquía tipográfica por opacidad.
 * - Única línea finísima translúcida (border-t border-black/5 o white/5)
 *   para separar el final del post del inicio de la sección de comentarios.
 */

import React, { useState } from 'react';
import type { SocialPost } from './types';
import { CHANNEL_CONFIG } from './channelConfig';
import { ProfileHeaderCard, type ProfileHeaderCardProfile } from './ProfileHeaderCard';
import {
  Camera as CameraIcon,
  Zap,
  Sparkles,
  Activity,
  Fingerprint,
  Flame,
  X,
  Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PostFeedCardProps {
  post: SocialPost;
  onReply: (post: SocialPost) => void;
  /** Callback opcional al hacer clic en el autor → navega a /@handle */
  onAuthorClick?: (post: SocialPost) => void;
  /** Variante de tema: 'light' (default, feed N2) o 'dark' (Feed Ninja) */
  variant?: 'light' | 'dark';
  /**
   * Vista Timeline (Panel N2): cuando hay imagen, el texto se oculta por
   * defecto (visual-first). Al hacer clic en la imagen o en "Ver más"
   * se revela el texto. Default: true.
   */
  isTimelineView?: boolean;
  /** Perfil compartido embebible → renderiza ProfileHeaderCard dentro del post */
  sharedProfile?: ProfileHeaderCardProfile;
}

/** Formatea timestamp ISO a relativo ("hace 2h", "ayer", etc.) */
const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  // Si el string no es una fecha ISO parseable (ej. "hace 2 horas"),
  // devolverlo tal cual para soportar datos demo con tiempo relativo.
  if (Number.isNaN(date.getTime())) return isoString;

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHour < 24) return `hace ${diffHour}h`;
  if (diffDay === 1) return 'ayer';
  if (diffDay < 7) return `hace ${diffDay}d`;
  return new Date(isoString).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
};

/** Formatea números grandes (1234 → "1.2K") */
const formatCount = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

/**
 * Iconos abstractos para la psicología de acción.
 * La elección es DETERMINISTA (hash del post.id) para evitar parpadeos
 * en re-renders y mantener compatibilidad total con React.memo.
 * Zap, Sparkles y Fingerprint son los iconos base; Activity y Flame
 * aportan variación sin romper la coherencia abstracta.
 */
const ABSTRACT_ICONS = [Zap, Sparkles, Activity, Fingerprint, Flame] as const;

/** Hash simple determinista a partir del ID del post */
const hashPostId = (postId: string): number => {
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash * 31 + postId.charCodeAt(i)) >>> 0;
  }
  return hash;
};

/** Devuelve los 3 iconos abstractos deterministas para un post (like, comment, share) */
const getPostActionIcons = (postId: string) => {
  const hash = hashPostId(postId);
  /* Defensa runtime total: filtra valores undefined/NaN y cae a Zap como
     fallback — garantiza que NUNCA se renderice un elemento tipo undefined. */
  const icons = ABSTRACT_ICONS.filter((icon): icon is LucideIcon => Boolean(icon));
  const safeLength = icons.length > 0 ? icons.length : 1;
  const likeIcon = icons[hash % safeLength] ?? Zap;
  const commentIcon = icons[(hash >> 3) % safeLength] ?? Zap;
  const shareIcon = icons[(hash >> 6) % safeLength] ?? Zap;
  return { likeIcon, commentIcon, shareIcon };
};

/** Nombres demo para la prueba social y comentarios (deterministas por post) */
const PROOF_NAMES = ['María', 'Carlos', 'Ana', 'Luis', 'Sofía', 'Diego'];

const PROOF_COMMENTS = [
  '¡Me encanta este contenido! 🔥',
  'Totalmente de acuerdo, gran trabajo.',
  '¿Cómo puedo probar esto en mi negocio?',
];

const AVATAR_GRADIENTS = ['bg-fuchsia-500/80', 'bg-emerald-500/80', 'bg-sky-500/80'];

const PostFeedCardComponent: React.FC<PostFeedCardProps> = ({
  post,
  onReply,
  onAuthorClick,
  variant = 'light',
  isTimelineView = true,
  sharedProfile,
}) => {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.metrics.likes);
  // Expandir comentarios — experiencia light (sin modales fullscreen)
  const [showComments, setShowComments] = useState(false);
  // Timeline Visual-First: texto oculto por defecto cuando hay imagen
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const authorHandle = post.handle ?? post.authorHandle.replace(/^@/, '');
  const isDark = variant === 'dark';

  // Controladores visual-first del Timeline (Panel N2)
  const hasImage = !!post.media_url;
  const shouldShowText = !isTimelineView || !hasImage || isTextExpanded;
  const showVerMas = isTimelineView && hasImage && !isTextExpanded;

  const handleAuthorClick = () => {
    if (authorHandle) {
      onAuthorClick?.(post);
    }
  };

  /* Fallback defensivo de canal: si un consumidor (feed real o Playground) pasa
     un channel no soportado, cae a Instagram en lugar de renderizar undefined. */
  const channelInfo = CHANNEL_CONFIG[post.channel] ?? CHANNEL_CONFIG.instagram;
  const { likeIcon: LikeIcon, commentIcon: CommentIcon, shareIcon: ShareIcon } = getPostActionIcons(post.id);

  // Prueba social determinista: 2-3 avatares + contador de reacciones
  const proofHash = hashPostId(post.id);
  const proofCount = 2 + (proofHash % 2); // 2 o 3
  const proofNames = Array.from(
    { length: proofCount },
    (_, i) => PROOF_NAMES[(proofHash >> (i * 3)) % PROOF_NAMES.length],
  );
  const proofReactionCount = 12 + (proofHash % 89); // 12..100

  return (
    <div
      className={`mb-4 !p-0 ${
        isDark ? 'glass-card-dark' : 'glass-card-light'
      } hover-lift cursor-pointer flex flex-col`}
    >
      {/* ═══ 0. Perfil Compartido Embebible (ProfileHeaderCard — Capa 1) ═══ */}
      {sharedProfile && (
        <ProfileHeaderCard
          profile={sharedProfile}
          isEmbedded
          isDark={isDark}
        />
      )}

      {/* ═══ 1. Imagen Edge-to-Edge (A Sangre / Full-Bleed) ═══
          Ocupa el 100% del ancho, tocando exactamente los bordes
          izquierdo y derecho de la tarjeta. Sin padding ni redondeo. */}
      {post.media_url && (
        <button
          type="button"
          onClick={() => setIsTextExpanded(true)}
          className="relative w-full overflow-hidden flex-shrink-0 block cursor-pointer text-left"
          aria-label="Ver texto completo del post"
          title="Ver texto completo del post"
        >
          <img
            src={post.media_url}
            alt=""
            loading="lazy"
            className="w-full aspect-[16/10] object-cover"
          />
          {/* Badge "Foto" — chip translúcido (Capa 1) con blur para legibilidad sobre imagen */}
          <span
            className={`absolute bottom-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 backdrop-blur-md text-[10px] font-medium tracking-wide ${
              isDark ? 'glass-chip-dark' : 'glass-chip-light'
            }`}
          >
            <CameraIcon size={12} strokeWidth={1.5} />
            Foto
          </span>

          {/* Prueba social superpuesta — avatares apilados + reacciones (FOMO) */}
          <div className="absolute bottom-2 right-2 flex items-center">
            <div className="flex -space-x-2">
              {proofNames.map((name, i) => (
                <span
                  key={name}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-medium text-white/90 ${
                    AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                  } ${isDark ? 'border-[#12121a]/80 backdrop-blur-sm' : 'border-white/80 backdrop-blur-sm'}`}
                  title={name}
                >
                  {name.charAt(0)}
                </span>
              ))}
            </div>
            <span
              className={`ml-2 px-2 py-0.5 backdrop-blur-md text-[10px] font-medium tracking-wide ${
                isDark ? 'glass-chip-dark' : 'glass-chip-light'
              }`}
            >
              +{proofReactionCount}
            </span>
          </div>
        </button>
      )}

      {/* ═══ 2. Cabecera: Avatar + Autor (padding lateral + superior) ═══ */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-3">
        {/* Avatar + badge de entidad (único) + punto verde de estado activo */}
        <div className="relative shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm tracking-wide ${
              post.isOnline
                ? isDark
                  ? 'bg-emerald-500/20 text-emerald-400/90'
                  : 'bg-emerald-500/10 text-emerald-700/90'
                : isDark
                  ? 'bg-white/10 text-white/40'
                  : 'bg-gray-500/10 text-gray-500/60'
            }`}
          >
            {post.authorAvatar}
          </div>
          {/* Badge de entidad (red social) superpuesto sobre el avatar */}
          <span
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
              isDark ? 'glass-chip-dark' : 'glass-chip-light'
            }`}
            title={channelInfo.label}
          >
            {channelInfo.icon}
          </span>
          {post.isOnline && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 bg-emerald-500/90 ${
                isDark ? 'border-[#12121a]/80' : 'border-white/80'
              }`}
            />
          )}
        </div>

        {/* Header: nombre (text-title) + @handle (text-meta) + timestamp (text-meta) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleAuthorClick}
              className={`text-title truncate transition-colors cursor-pointer ${
                isDark ? 'hover:text-fuchsia-400' : 'hover:text-fuchsia-500'
              }`}
              title={`Ver perfil de ${post.authorName}`}
            >
              {post.authorName}
            </button>
            {authorHandle && (
              <button
                type="button"
                onClick={handleAuthorClick}
                className={`text-meta transition-colors cursor-pointer ${
                  isDark ? 'hover:text-fuchsia-400' : 'hover:text-fuchsia-500'
                }`}
                title={`Ir a /@${authorHandle}`}
              >
                @{authorHandle}
              </button>
            )}
            {/* Link "Ver más" — revela el texto oculto en Timeline visual-first */}
            {showVerMas && (
              <button
                type="button"
                onClick={() => setIsTextExpanded(true)}
                className={`text-[11px] font-medium tracking-wide transition-colors cursor-pointer active-press ${
                  isDark
                    ? 'text-fuchsia-400/80 hover:text-fuchsia-300'
                    : 'text-fuchsia-500/80 hover:text-fuchsia-500'
                }`}
                title="Ver descripción completa del post"
              >
                Ver más
              </button>
            )}
            <span className="text-meta ml-auto shrink-0">
              {formatRelativeTime(post.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ 3. Contenido + Footer (padding lateral + base) ═══ */}
      <div className="px-4 pb-4">
        {/* Body: contenido del post (text-body) — oculto por defecto en Timeline con imagen */}
        {shouldShowText && (
          <p className="text-body whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* ═══ Footer: iconos de interacción abstractos + active-press ═══ */}
        <div className="flex items-center gap-5 mt-3">
          {/* Like — icono abstracto determinista (acento fucsia único) */}
          <button
            onClick={() => {
              setLiked(!liked);
              setLocalLikes(prev => (liked ? prev - 1 : prev + 1));
            }}
            className={`flex items-center gap-1 text-sm active-press ${
              liked
                ? 'text-fuchsia-500 scale-110'
                : isDark
                  ? 'text-white/60 hover:text-fuchsia-400'
                  : 'text-gray-500/60 hover:text-fuchsia-500'
            }`}
            title={liked ? 'Quitar reacción' : 'Reaccionar'}
          >
            <LikeIcon size={17} strokeWidth={1.5} className={liked ? 'fill-current' : ''} />
            <span className="text-xs font-medium tracking-wide">{formatCount(localLikes)}</span>
          </button>

          {/* Comentarios — icono abstracto + toggle de expansión light */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1 text-sm active-press ${
              showComments
                ? isDark
                  ? 'text-fuchsia-400'
                  : 'text-fuchsia-500'
                : isDark
                  ? 'text-white/60 hover:text-fuchsia-400'
                  : 'text-gray-500/60 hover:text-fuchsia-500'
            }`}
            title={showComments ? 'Cerrar comentarios' : 'Ver comentarios'}
          >
            <CommentIcon size={17} strokeWidth={1.5} />
            <span className="text-xs font-medium tracking-wide">{formatCount(post.metrics.comments)}</span>
          </button>

          {/* Shares — icono abstracto determinista (informativo, sin interacción) */}
          <div
            className={`flex items-center gap-1 text-sm ${isDark ? 'text-white/40' : 'text-gray-400/40'}`}
            title="Compartidos"
          >
            <ShareIcon size={17} strokeWidth={1.5} />
            <span className="text-xs font-medium tracking-wide">{formatCount(post.metrics.shares)}</span>
          </div>

          {/* Responder → abre N3 */}
          <button
            onClick={() => onReply(post)}
            className={`flex items-center gap-1 text-sm active-press ml-auto ${
              isDark ? 'text-fuchsia-400 hover:text-fuchsia-300' : 'text-gray-500/60 hover:text-fuchsia-500'
            }`}
            title="Responder a este post"
          >
            <Send size={15} strokeWidth={1.5} />
            <span className="text-xs font-medium tracking-wide hidden sm:inline">Responder</span>
          </button>
        </div>
      </div>

      {/* ═══ 4. Comentarios — Experiencia Light (Efecto Lienzo) ═══
          Sin fullscreen, sin cajas, sin fondos ni burbujas.
          Separados por espacio en blanco (gap-4) + jerarquía tipográfica. */}
      {showComments && (
        <div
          className={`px-4 pb-4 pt-4 border-t ${
            isDark ? 'border-white/5' : 'border-black/5'
          }`}
        >
          {/* Header de comentarios — text-title, sin caja */}
          <div className="flex items-center justify-between">
            <span className="text-title">
              Comentarios
            </span>
            <button
              type="button"
              onClick={() => setShowComments(false)}
              title="Cerrar comentarios"
              className={`w-7 h-7 rounded-full flex items-center justify-center active-press ${
                isDark
                  ? 'text-white/40 hover:text-white/90 hover:bg-white/10'
                  : 'text-gray-400/40 hover:text-gray-900/90 hover:bg-black/5'
              }`}
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Lista de comentarios — CERO cajas, solo gap-4 + opacidades */}
          <div className="flex flex-col gap-4 mt-4">
            {proofNames.map((name, i) => (
              <div key={`${name}-${i}`} className="flex items-start gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium text-white/90 shrink-0 ${
                    AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                  }`}
                >
                  {name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium tracking-wide ${
                        isDark ? 'text-white/90' : 'text-gray-900/90'
                      }`}
                    >
                      {name}
                    </span>
                    <span className="text-caption ml-auto">
                      hace {i + 1}h
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 leading-relaxed ${
                      isDark ? 'text-white/60' : 'text-gray-600/80'
                    }`}
                  >
                    {PROOF_COMMENTS[i % PROOF_COMMENTS.length]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input ultra-light — campo translúcido (superficie subtle, no caja) */}
          <div className="mt-4">
            <div
              className={`w-full px-4 py-2 text-sm flex items-center gap-2 ${
                isDark ? 'glass-subtle-dark' : 'glass-subtle-light'
              }`}
            >
              <span className="flex-1 truncate tracking-wide">Escribe un comentario...</span>
              <Send
                size={14}
                strokeWidth={1.5}
                className={isDark ? 'text-fuchsia-400' : 'text-gray-400/40'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Comparador personalizado para React.memo.
 * Evita re-renderizados si el post, el callback, la variante y la vista
 * timeline no cambiaron.
 */
const arePropsEqual = (prev: PostFeedCardProps, next: PostFeedCardProps): boolean => {
  if (prev.post.id !== next.post.id) return false;
  if (prev.post.content !== next.post.content) return false;
  if (prev.post.metrics.likes !== next.post.metrics.likes) return false;
  if (prev.post.metrics.comments !== next.post.metrics.comments) return false;
  if (prev.post.metrics.shares !== next.post.metrics.shares) return false;
  if (prev.post.authorName !== next.post.authorName) return false;
  if (prev.post.handle !== next.post.handle) return false;
  if (prev.post.media_url !== next.post.media_url) return false;
  if (prev.onAuthorClick !== next.onAuthorClick) return false;
  if (prev.variant !== next.variant) return false;
  if (prev.isTimelineView !== next.isTimelineView) return false;
  if (prev.sharedProfile !== next.sharedProfile) return false;
  return true;
};

export const PostFeedCard = React.memo(PostFeedCardComponent, arePropsEqual);

export default PostFeedCard;