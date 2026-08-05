/**
 * @module VideoCard
 * @description Componente atómico de tarjeta de video (Capa 2) con reproducción
 * en hover y expansión adaptativa autocontenida.
 *
 * Comportamiento:
 * - Miniatura: al hacer hover se reproduce el video (muted); al salir se pausa
 *   y reinicia. Al hacer clic se expande.
 * - Expandido: ocupa el 100% del entorno. En desktop (md:absolute inset-0)
 *   llena el panel N3 que lo contiene (relative). En móvil (fixed) cubre
 *   toda la pantalla. Incluye backdrop borroso, video central con controles,
 *   botón de cierre e info del creador.
 *
 * Estados locales:
 *   - isPlaying: boolean — reproducción en hover/clic.
 *   - isExpanded: boolean — expansión adaptativa al entorno (inicio: false).
 *   - isMuted: boolean — mute inicial true por políticas de navegador.
 */

import React, { useRef, useState, useCallback } from 'react';
import { X, Eye, Play } from 'lucide-react';
import { Avatar } from './Avatar';

export interface VideoCardProps {
  /** URL del archivo de video a reproducir */
  videoUrl: string;
  /** URL del póster/imagen de portada (miniatura + backdrop) */
  posterUrl: string;
  /** Contador de vistas formateado (ej. "1.2K") */
  views: string;
  /** Nombre del autor/creador del video */
  authorName: string;
  /** Handle del autor sin @ (ej. "jazs.ec") */
  authorHandle: string;
  /** URL del avatar del autor (opcional — fallback a inicial) */
  authorAvatar?: string;
  /** Descripción o caption del video */
  description: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  videoUrl,
  posterUrl,
  views,
  authorName,
  authorHandle,
  authorAvatar,
  description,
}) => {
  /* ─── Estados locales autocontenidos ─── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  /* ─── Hover: reproducir / pausar+reiniciar la miniatura ─── */
  const handleMouseEnter = useCallback(() => {
    if (isExpanded) return;
    videoRef.current?.play();
    setIsPlaying(true);
  }, [isExpanded]);

  const handleMouseLeave = useCallback(() => {
    if (isExpanded) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  }, [isExpanded]);

  /* ─── Clic: expandir la tarjeta al entorno ─── */
  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
  }, []);

  /* ─── Cerrar: contraer de vuelta a la tarjeta original ─── */
  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    setIsMuted(true);
    setIsPlaying(false);
  }, []);

  /* ═══ A. Estado Colapsado — Tarjeta Miniatura ═══ */
  if (!isExpanded) {
    return (
      <div
        className="relative aspect-[9/16] w-full overflow-hidden bg-[#0a0a0f] cursor-pointer transition-all duration-300 hover:-translate-y-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleExpand();
          }
        }}
        aria-label={`Ver video de ${authorName}`}
      >
        {/* Video miniatura — reproduce en hover, silenciado */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          muted={isMuted}
          playsInline
          preload="metadata"
          loop
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay oscuro suave para legibilidad (solo cuando no está reproduciendo) */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        )}

        {/* Indicador Play — visible cuando no está reproduciendo */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Play size={20} strokeWidth={1.5} fill="currentColor" className="ml-0.5" />
            </span>
          </div>
        )}

        {/* Badge de vistas — esquina superior izquierda */}
        <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium tracking-wide">
          <Eye size={11} strokeWidth={1.5} />
          {views}
        </div>

        {/* Info inferior — degradado oscuro + avatar + autor + descripción */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <Avatar
              src={authorAvatar}
              fallback={authorName.charAt(0).toUpperCase()}
              size="sm"
              className="border-white/20"
            />
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate leading-tight">
                {authorName}
              </p>
              <p className="text-white/60 text-[10px] truncate leading-tight">
                @{authorHandle}
              </p>
            </div>
          </div>
          <p className="text-white/80 text-[11px] line-clamp-2 mt-1.5 leading-snug">
            {description}
          </p>
        </div>
      </div>
    );
  }

  /* ═══ B. Estado Expandido — Adaptativo al Entorno ═══ */
  return (
    <div className="fixed md:absolute inset-0 z-30 w-full h-full bg-black/95 flex flex-col justify-between animate-fade-in text-white overflow-hidden">
      {/* Backdrop — póster borroso (solo desktop) */}
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center blur-3xl scale-125 opacity-25 pointer-events-none z-0"
        style={{ backgroundImage: `url(${posterUrl})` }}
      />

      {/* Botón de cierre — esquina superior izquierda */}
      <button
        type="button"
        onClick={handleCollapse}
        title="Cerrar video"
        className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors"
        aria-label="Cerrar video"
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      {/* Video central — nítido, con controles nativos */}
      <div className="flex-1 flex items-center justify-center px-4 pt-16 pb-4 z-20 min-h-0">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          controls
          autoPlay
          playsInline
          muted={false}
          className="max-h-[75vh] md:max-h-[80vh] aspect-[9/16] object-contain rounded-2xl shadow-2xl bg-black"
        />
      </div>

      {/* Info del creador — degradado oscuro inferior */}
      <div className="relative z-20 px-4 pb-5 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-start gap-3">
          <Avatar
            src={authorAvatar}
            fallback={authorName.charAt(0).toUpperCase()}
            size="lg"
            className="border-white/20"
          />
          <div className="min-w-0 flex-1">
            <p className="text-white text-base font-semibold truncate leading-tight">
              {authorName}
            </p>
            <p className="text-white/60 text-sm truncate leading-tight mt-0.5">
              @{authorHandle}
            </p>
            <p className="text-white/80 text-sm leading-relaxed mt-2">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;