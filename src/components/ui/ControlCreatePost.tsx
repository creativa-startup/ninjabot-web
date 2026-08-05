/**
 * @module ControlCreatePost
 * @description Componente puro (UI atómica) para publicar texto, fotos y videos.
 * 100% Sandbox: gestiona solo estados locales y emite el payload por callback.
 * No importa ni conecta servicios reales (supabase / postService).
 *
 * Estética Premium SaaS / UX UI CARD:
 *  - Materialidad flotante: fondos translúcidos con blur y bordes invisibles.
 *  - Light:  bg-white/90 backdrop-blur-md border-black/5
 *  - Dark:   bg-white/5 border-white/10
 *  - Regla estricta: NO shadow-md/lg/xl ni bordes sólidos.
 *
 * Interactividad:
 *  - Textarea con contador de caracteres y placeholder "¿Qué está pasando?".
 *  - Adjuntar mocks de fotos (ImageIcon) y videos (VideoIcon).
 *  - Seleccionar canal de publicación Meta (Instagram, Facebook).
 *  - Al publicar emite { text, media } y limpia el draft.
 *
 * Behavioral Design (Anti-spam visual):
 *  - Los usuarios nuevos solo pueden publicar texto.
 *  - Fotografías y videos se desbloquean al alcanzar 1,000 jazs (jazs prop).
 *  - Mientras esté bloqueado, los botones multimedia muestran candado
 *    y opacidad reducida con tooltip de la meta.
 */

import React, { useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, Video, Send, Lock } from 'lucide-react';
import { FaInstagram, FaFacebook } from 'react-icons/fa';

/** Tipo de adjunto simulado (foto o video) */
interface CreatePostMedia {
  type: 'photo' | 'video';
  name: string;
}

/** Payload emitido al publicar — solo Sandbox, no persiste en BD */
interface CreatePostPayload {
  text: string;
  media: CreatePostMedia[];
}

export interface ControlCreatePostProps {
  /** Controla el despliegue/colapso fluido de la card */
  isOpen: boolean;
  /** Callback para cerrar la card desde el botón X */
  onClose: () => void;
  /** Callback al publicar — emite el payload del draft (texto + adjuntos) */
  onSubmit?: (payload: CreatePostPayload) => void;
  /** Tema del shell maestro (dark/light) para adaptar superficies translúcidas */
  isShellDark?: boolean;
  /** Métrica de interacciones (jazs) — desbloquea fotos/videos al alcanzar 1,000 */
  jazs?: number;
}

/** Canales simulados para la fila de publicación */
interface ChannelOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/* Canales de publicación — solo Meta (Enrutamiento Inteligente):
   texto → Facebook, imagen → Instagram + Facebook */
const CHANNELS: ChannelOption[] = [
  { id: 'instagram', label: 'Instagram', icon: <FaInstagram className="w-3.5 h-3.5" /> },
  { id: 'facebook', label: 'Facebook', icon: <FaFacebook className="w-3.5 h-3.5" /> },
];

const MAX_CHARS = 500;

/* Meta de desbloqueo multimedia (regla de negocio anti-spam) */
const MULTIMEDIA_UNLOCK_JAZS = 1000;

export const ControlCreatePost: React.FC<ControlCreatePostProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isShellDark = false,
  jazs = 0,
}) => {
  const [draft, setDraft] = useState('');
  const [media, setMedia] = useState<CreatePostMedia[]>([]);
  const [activeChannels, setActiveChannels] = useState<Set<string>>(new Set(['instagram']));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Behavioral Design: fotos/videos bloqueados hasta los 1,000 jazs */
  const isMultimediaLocked = jazs < MULTIMEDIA_UNLOCK_JAZS;

  /* Auto-focus del textarea al desplegar la card */
  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [isOpen]);

  /* Cerrar con tecla Escape (control accesible) */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const addMockMedia = (type: 'photo' | 'video') => {
    const label = type === 'photo' ? 'Foto' : 'Video';
    const mock: CreatePostMedia = {
      type,
      name: `${label} simulada ${media.length + 1}`,
    };
    setMedia((prev) => [...prev, mock]);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleChannel = (id: string) => {
    setActiveChannels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text && media.length === 0) return;
    onSubmit?.({ text, media });
    setDraft('');
    setMedia([]);
    setActiveChannels(new Set(['instagram']));
  };

  const canPublish = draft.trim().length > 0 || media.length > 0;

  /* Superficies translúcidas según tema del shell */
  const surface = isShellDark
    ? 'bg-white/5 border-white/10'
    : 'bg-white/90 backdrop-blur-md border-black/5';
  const textPrimary = isShellDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isShellDark ? 'text-gray-400' : 'text-gray-500';
  const chipBase = isShellDark ? 'border-white/10' : 'border-black/5';
  const chipActive =
    isShellDark
      ? 'bg-fuchsia-500/30 text-fuchsia-300 border-fuchsia-500/30'
      : 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20';
  const chipIdle = isShellDark
    ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
    : 'bg-black/5 text-gray-500 hover:text-gray-700 hover:bg-black/10';

  return (
    <div className="flex-shrink-0 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className={`w-full border-b backdrop-blur-md transition-colors duration-500 ${surface}`}
      >
        {/* ─── Header de la card ─── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
              N
            </span>
            <div className="min-w-0">
              <p className={`text-[13px] font-bold leading-tight truncate ${textPrimary}`}>
                Crear nuevo Jaz
              </p>
              <p className={`text-[10px] leading-tight truncate ${textSecondary}`}>
                Texto, fotos y video · Sandbox
              </p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isShellDark
                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                : 'text-gray-400 hover:text-gray-700 hover:bg-black/5'
            }`}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* ─── Textarea del draft ─── */}
        <div className="px-4">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={MAX_CHARS}
            placeholder="¿Qué está pasando?"
            className={`w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:transition-opacity ${
              isShellDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
            } ${textPrimary}`}
          />
        </div>

        {/* ─── Preview de adjuntos (mocks fotos / videos) ─── */}
        {media.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {media.map((item, idx) => (
              <span
                key={`${item.type}-${idx}`}
                className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  item.type === 'photo'
                    ? isShellDark
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/10'
                    : isShellDark
                      ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                      : 'bg-sky-500/10 text-sky-600 border-sky-500/10'
                }`}
              >
                {item.type === 'photo' ? (
                  <ImageIcon size={13} strokeWidth={1.5} />
                ) : (
                  <Video size={13} strokeWidth={1.5} />
                )}
                {item.name}
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  title="Quitar adjunto"
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    isShellDark ? 'hover:bg-white/15' : 'hover:bg-black/10'
                  }`}
                >
                  <X size={10} strokeWidth={1.5} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ─── Toolbar Multimedia + Contador de caracteres ─── */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-1.5">
            {/* Botón Foto — bloqueado con candado hasta los 1,000 jazs */}
            <button
              type="button"
              onClick={() => addMockMedia('photo')}
              disabled={isMultimediaLocked}
              title={isMultimediaLocked ? 'Bloqueado — desbloquea fotos al llegar a 1,000 jazs' : 'Adjuntar foto'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                isMultimediaLocked ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
              } ${
                isShellDark
                  ? 'text-rose-300 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20'
                  : 'text-rose-600 bg-rose-500/10 border-rose-500/10 hover:bg-rose-500/20'
              }`}
            >
              <ImageIcon size={14} strokeWidth={1.5} />
              Foto
              {isMultimediaLocked && <Lock size={11} strokeWidth={1.5} />}
            </button>

            {/* Botón Video — bloqueado con candado hasta los 1,000 jazs */}
            <button
              type="button"
              onClick={() => addMockMedia('video')}
              disabled={isMultimediaLocked}
              title={isMultimediaLocked ? 'Bloqueado — desbloquea videos al llegar a 1,000 jazs' : 'Adjuntar video'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                isMultimediaLocked ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
              } ${
                isShellDark
                  ? 'text-sky-300 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20'
                  : 'text-sky-600 bg-sky-500/10 border-sky-500/10 hover:bg-sky-500/20'
              }`}
            >
              <Video size={14} strokeWidth={1.5} />
              Video
              {isMultimediaLocked && <Lock size={11} strokeWidth={1.5} />}
            </button>

            {/* Progreso hacia el desbloqueo (Behavioral Design) */}
            {isMultimediaLocked && (
              <span className={`text-[10px] font-medium hidden sm:inline ${textSecondary}`}>
                {jazs.toLocaleString('es-EC')}/1,000 jazs
              </span>
            )}
          </div>

          <span className={`text-[10px] tabular-nums ${textSecondary}`}>
            {draft.length}/{MAX_CHARS}
          </span>
        </div>

        {/* ─── Canales de publicación (chips translúcidos) ─── */}
        <div className="px-4 pb-3">
          <p className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>
            Publicar en
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CHANNELS.map((channel) => {
              const isActive = activeChannels.has(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => toggleChannel(channel.id)}
                  title={channel.label}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all active:scale-95 ${chipBase} ${
                    isActive ? chipActive : chipIdle
                  }`}
                >
                  {channel.icon}
                  {channel.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Footer: Indicador Meta (izq) + Resumen canales (der) ─── */}
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
          {/* Indicador de Enrutamiento Inteligente Meta — teaser difuminado
              (capacidad futura: texto → Facebook, imagen → Instagram + Facebook) */}
          <div
            className={`flex items-center gap-2 min-w-0 opacity-50 ${textSecondary}`}
            title="Próximamente: enrutamiento inteligente a Meta — texto → Facebook, imagen → Instagram + Facebook"
          >
            <span className="flex items-center gap-1.5">
              <FaInstagram className="w-3.5 h-3.5 opacity-60" />
              <FaFacebook className="w-3.5 h-3.5 opacity-60" />
            </span>
            <span className="text-[10px] font-medium truncate">
              Meta IA · Enrutamiento inteligente
            </span>
            <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider opacity-60">
              próximamente
            </span>
          </div>

          {/* Resumen de canales + botón Publicar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-[10px] hidden md:inline ${textSecondary}`}>
              {activeChannels.size > 0
                ? `${activeChannels.size} ${activeChannels.size === 1 ? 'canal' : 'canales'} · Sandbox`
                : 'Sin canal seleccionado'}
            </span>
            <button
              type="submit"
              disabled={!canPublish}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${
                canPublish
                  ? isShellDark
                    ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-400'
                    : 'bg-fuchsia-500 text-white hover:bg-fuchsia-600'
                  : isShellDark
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-black/5 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={14} strokeWidth={1.5} />
              Publicar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ControlCreatePost;