/**
 * @module ChatDemoN3DetailPanel
 * @description Panel taxonómico N3 (Detail) del módulo Chats — versión Demo/Prototipo.
 * Encapsula el código inline que vivía en LayoutDemo.tsx: renderizado del chat,
 * muro de Jazs (Feed Ninja), empty states, burbuja de notas IA y panel N4 de historial.
 *
 * Taxonomía: [Domain]N[Level][Type]Panel → Chats + N3 + Detail + Panel
 * Principio de Layout Decoupling: recibe estado y callbacks por props;
 * el orquestador (LayoutDemo) mantiene el estado global del shell.
 *
 * Estética Premium UX/UI Card: fondos translúcidos con blur, bordes invisibles
 * (border-black/5 claro / border-white/10 oscuro) y sombra ambiental única.
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  Sparkles,
  X,
  Check,
  Loader2,
  Send,
  Pencil,
  Notebook,
  MessageCircle,
} from 'lucide-react';
import {
  CHAT_CARDS,
  DEMO_MESSAGES,
  DEMO_NOTES,
  JAZS_POSTS,
} from './mockChats';
import type { DemoNote } from './mockChats';
import type { SocialPost } from '../../features/chats/types';
import { PostFeedCard } from '../../features/chats/PostFeedCard';
import { ControlCreatePost } from '../../components/ui/ControlCreatePost';
import { Avatar } from '../../components/ui/Avatar';

export interface ChatDemoN3DetailPanelProps {
  /** Modo oscuro del shell demo */
  isShellDark?: boolean;
  /** Modo Feed Ninja activo (muro de Jazs en lugar de chat) */
  feedNinjaActive?: boolean;
  /** Identificador del chat seleccionado (null = ninguno) */
  selectedId?: string | null;
  /** Estado vacío del chat seleccionado */
  isEmpty?: boolean;
  /** Burbuja de notas IA abierta */
  isNoteBubbleOpen?: boolean;
  /** Borrador de la nota en la burbuja IA */
  noteDraft?: string;
  /** Guardando nota (estado async) */
  isSavingNote?: boolean;
  /** Nota recién guardada destacada en N4 */
  justSavedNote?: boolean;
  /** Lista de notas del historial N4 */
  demoNotes?: DemoNote[];
  /** Panel N4 (historial de notas) abierto */
  isN4Open?: boolean;
  /** Callback "Volver a la lista" (móvil) */
  onBackClick?: () => void;
  /** Callback toggle del estado vacío (botón temporal) */
  onToggleEmpty?: () => void;
  /** Callback abrir/cerrar burbuja de notas IA */
  onToggleNoteBubble?: () => void;
  /** Callback abrir panel N4 (historial de notas) */
  onOpenN4History?: () => void;
  /** Callback cerrar panel N4 */
  onCloseN4?: () => void;
  /** Callback cambio de borrador de nota */
  onNoteDraftChange?: (value: string) => void;
  /** Callback guardar nota (crea DemoNote y abre N4) */
  onSaveNote?: () => void;
  /** Callback botón "Directo" en muro de Jazs → convierte en chat */
  onDirectToChat?: () => void;
}

export const ChatDemoN3DetailPanel: React.FC<ChatDemoN3DetailPanelProps> = ({
  isShellDark = false,
  feedNinjaActive = false,
  selectedId = null,
  isEmpty = false,
  isNoteBubbleOpen = false,
  noteDraft = '',
  isSavingNote = false,
  justSavedNote = false,
  demoNotes = DEMO_NOTES,
  isN4Open = false,
  onBackClick,
  onToggleEmpty,
  onToggleNoteBubble,
  onOpenN4History,
  onCloseN4,
  onNoteDraftChange,
  onSaveNote,
  onDirectToChat,
}) => {
  /* ControlCreatePost abierto por defecto en el modo Ninja (feed principal) */
  const [isPublishOpen, setIsPublishOpen] = useState(true);

  const selectedChat = CHAT_CARDS.find((c) => c.id === selectedId) ?? null;

  return (
    <div
      className={`w-full h-full relative flex flex-col overflow-hidden select-none panel-n3-clean transition-colors duration-500 ${
        feedNinjaActive ? 'bg-transparent text-white' : isShellDark ? 'text-white' : 'text-gray-900'
      }`}
      style={isShellDark ? { backgroundColor: 'var(--panel-n3)' } : undefined}
    >
      {/* A. Header N3 — cabecera taxonómica (solo con chat seleccionado y sin modo ninja) */}
      {selectedId !== null && !feedNinjaActive && (
        <div
          className={`flex items-center justify-between p-4 flex-shrink-0 transition-colors duration-500 ${
            isShellDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md'
          }`}
        >
          {/* Izquierda: atrás (móvil) + avatar + identidad */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Botón "Atrás" — solo visible en móvil */}
            <button
              type="button"
              onClick={onBackClick}
              title="Volver a la lista"
              className={`md:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                isShellDark
                  ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                  : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            <Avatar
              fallback={selectedChat?.name.charAt(0).toUpperCase() ?? 'U'}
              size="md"
            />
            <div className="min-w-0">
              <p className={`font-semibold text-sm truncate ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedChat?.name ?? 'Selecciona un chat'}
              </p>
              <p className={`text-xs truncate ${isShellDark ? 'text-gray-400' : 'text-gray-500'}`}>
                @{selectedChat?.name.toLowerCase().replace(/\s+/g, '.') ?? 'usuario'}
              </p>
            </div>
          </div>

          {/* Derecha: switches IA + toggle temporal empty */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Botón temporal: Toggle Empty */}
            <button
              type="button"
              onClick={onToggleEmpty}
              className="text-[10px] font-mono font-medium text-gray-500 bg-black/5 border border-black/5 rounded-full px-2 py-1 hover:bg-black/10 transition-colors"
            >
              [ Toggle Empty ]
            </button>

            {/* Switch 1: Agente Vendedor (activo verde) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-600 hidden sm:block">Agente Vendedor</span>
              <span className="w-7 h-4 rounded-full bg-green-500 flex items-center p-0.5">
                <span className="w-3 h-3 rounded-full bg-white ml-auto" />
              </span>
            </div>

            {/* Switch 2: Agente Apuntador (inactivo gris) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-600 hidden sm:block">Agente Apuntador</span>
              <span className="w-7 h-4 rounded-full bg-black/10 flex items-center p-0.5">
                <span className="w-3 h-3 rounded-full bg-white" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* B. Zona central: Feed Ninja > Empty Inicial > Empty State > Feed de Mensajes */}
      {feedNinjaActive ? (
        /* Feed Social Inmersivo — muro central de Jazs (Social Commerce limpio y enfocado) */
        <div className="flex-1 bg-transparent overflow-y-auto">
          <div className="w-full max-w-2xl px-4 py-6 flex flex-col gap-6">
            {/* Sección 1: Título "Los Jazs" — encabezado tipográfico elegante */}
            <h1 className="text-2xl font-semibold text-title tracking-tight">
              Los Jazs
            </h1>

            {/* Sección 2: Stories Reel — scroll horizontal con Avatar size="xl" + anillo degradado */}
            <section aria-label="Historias">
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
                {JAZS_POSTS.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => onDirectToChat?.()}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16 cursor-pointer active:scale-95 transition-transform"
                    title={`Ver historia de ${post.name}`}
                  >
                    {/* Patrón de composición: anillo degradado + Avatar size="xl" */}
                    <span className="p-[2px] rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500">
                      <Avatar
                        src={undefined}
                        fallback={post.name.charAt(0).toUpperCase()}
                        size="xl"
                        className="border-4 border-transparent"
                      />
                    </span>
                    <span className="text-[10px] truncate w-full text-center text-gray-400/80">
                      {post.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Sección 3: Crear Post (ControlCreatePost) */}
            <div className="shrink-0">
              <ControlCreatePost
                isOpen={isPublishOpen}
                onClose={() => setIsPublishOpen(false)}
                onSubmit={(payload) => console.log('Post mockeado:', payload)}
                isShellDark={true}
                jazs={450}
              />
            </div>

            {/* Sección 4: Listado de Posts (PostFeedCard) */}
            <div className="flex flex-col">
              {JAZS_POSTS.map((post) => {
                const socialPost: SocialPost = {
                  id: post.id,
                  authorName: post.name,
                  authorHandle: post.handle,
                  authorAvatar: post.name.charAt(0),
                  content: post.content,
                  timestamp: post.time,
                  channel: 'twitter',
                  metrics: { comments: 8, likes: 24, shares: 0 },
                  isOnline: true,
                  media_url: `https://picsum.photos/seed/${post.id}/600/400`,
                };
                return (
                  <PostFeedCard
                    key={post.id}
                    post={socialPost}
                    variant="dark"
                    onReply={() => onDirectToChat?.()}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : selectedId === null ? (
        /* Empty Inicial — Ningún chat seleccionado */
        <div className="flex-1 w-full h-full flex items-center justify-center bg-transparent p-6">
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/60 border border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex items-center justify-center text-gray-500">
              <MessageCircle size={22} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mt-4">Empieza una conversación</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Selecciona un chat o inicia una nueva conversación para ver los mensajes aquí.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 border border-black/5 rounded-full px-2.5 py-1">
              <Sparkles size={12} />
              Asistencia IA activa
            </span>
            <button
              type="button"
              className="mt-5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:bg-gray-800 transition-colors"
            >
              Nuevo Chat
            </button>
          </div>
        </div>
      ) : isEmpty ? (
        /* Empty State — Chat seleccionado pero sin mensajes */
        <div className="flex-1 w-full h-full flex items-center justify-center bg-transparent p-6">
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/60 border border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex items-center justify-center text-gray-500">
              <MessageCircle size={22} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mt-4">Empieza una conversación</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Selecciona un chat o inicia una nueva conversación para ver los mensajes aquí.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 border border-black/5 rounded-full px-2.5 py-1">
              <Sparkles size={12} />
              Asistencia IA activa
            </span>
            <button
              type="button"
              className="mt-5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:bg-gray-800 transition-colors"
            >
              Nuevo Chat
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Feed de Mensajes — burbujas estáticas */}
          <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-transparent`}>
            {DEMO_MESSAGES.map((msg) => (
              <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.mine
                      ? 'bg-brand text-white rounded-br-md'
                      : isShellDark
                        ? 'bg-white/10 text-white border border-white/10 rounded-bl-md'
                        : 'bg-white/80 backdrop-blur-md border border-black/5 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* C. Footer y Controles N4 (ControlChat + Input) */}
          <div
            className={`p-3 flex-shrink-0 flex flex-col gap-2 transition-colors duration-500 ${
              isShellDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md'
            }`}
          >
            {/* Barra de Controles (Trigger N4) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleNoteBubble}
                title="Nueva nota"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isShellDark
                    ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
                }`}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={onOpenN4History}
                title="Historial de notas"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isShellDark
                    ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
                }`}
              >
                <Notebook size={18} />
              </button>
            </div>

            {/* Caja de texto simulada */}
            <div className={`w-full rounded-full px-4 py-2 text-sm ${isShellDark ? 'bg-white/5 text-gray-400' : 'bg-black/5 text-gray-500'}`}>
              Escribe un mensaje...
            </div>
          </div>
        </>
      )}

      {/* ═══ Burbuja Flotante Interactiva (Nueva Nota) ═══ */}
      {isNoteBubbleOpen && (
        <div
          className={`absolute z-40 w-[320px] max-w-[calc(100%-2rem)] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] border backdrop-blur-xl flex flex-col overflow-hidden animate-slide-in-up left-4 ${
            feedNinjaActive
              ? 'glass-card-dark text-white border-white/10 top-4'
              : isShellDark
                ? 'glass-card-dark text-white border-white/10 bottom-24'
                : 'glass-card-light text-gray-800 border-black/5 bottom-24'
          }`}
        >
          {/* Header mini */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className={`flex items-center gap-2 text-sm font-semibold ${feedNinjaActive || isShellDark ? 'text-white' : 'text-gray-900'}`}>
              <Sparkles size={15} className={feedNinjaActive || isShellDark ? 'text-fuchsia-400' : 'text-fuchsia-600'} />
              Nueva Nota
            </span>
            <button
              type="button"
              onClick={onToggleNoteBubble}
              title="Cerrar burbuja"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                feedNinjaActive || isShellDark
                  ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                  : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
              }`}
            >
              <X size={16} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={noteDraft}
            onChange={(e) => onNoteDraftChange?.(e.target.value)}
            autoFocus
            placeholder="Escribe la idea o apunte aquí..."
            rows={3}
            className={`resize-none px-4 py-3 text-sm outline-none transition-colors ${
              feedNinjaActive || isShellDark
                ? 'bg-transparent text-white placeholder:text-gray-500'
                : 'bg-white/80 text-gray-800 placeholder:text-gray-400'
            }`}
          />

          {/* Footer: Guardar */}
          <div
            className="px-4 py-3"
          >
            <button
              type="button"
              onClick={onSaveNote}
              disabled={isSavingNote || !noteDraft.trim()}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                feedNinjaActive
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 shadow-[0_0_20px_rgba(224,86,253,0.3)] hover:shadow-[0_0_30px_rgba(224,86,253,0.5)] border border-white/20'
                  : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {isSavingNote ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando nota...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Guardar Nota
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Panel N4 (Historial de Notas) ═══ */}
      {isN4Open && (
        <div
          className={`absolute inset-0 z-30 panel-n4-floating flex flex-col animate-slide-in-right ${
            feedNinjaActive || isShellDark
              ? 'glass-card-dark backdrop-blur-2xl'
              : ''
          }`}
          style={feedNinjaActive || isShellDark ? { backgroundColor: 'var(--panel-n4)', boxShadow: 'var(--shadow-panel-n4-left)' } : undefined}
        >
          {/* Header N4 — título dinámico */}
          <div
            className={`flex items-center justify-between p-4 flex-shrink-0 ${
              feedNinjaActive || isShellDark ? 'glass-card-dark' : 'bg-white/80 backdrop-blur-md'
            }`}
          >
            <h3 className={`text-base font-semibold ${feedNinjaActive || isShellDark ? 'text-white' : 'text-gray-900'}`}>
              Historial de Notas
            </h3>
            <button
              type="button"
              onClick={onCloseN4}
              title="Cerrar"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                feedNinjaActive || isShellDark
                  ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                  : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Cuerpo N4 — Lista del Historial de Notas */}
          <div
            className={`flex-1 overflow-y-auto p-4 gap-3 flex flex-col ${
              feedNinjaActive || isShellDark ? 'bg-transparent' : 'bg-transparent'
            }`}
          >
            {demoNotes.map((note, index) => {
              const isNewHighlight = justSavedNote && index === 0;
              return (
                <div
                  key={note.id}
                  className={`border rounded-xl p-4 transition-all duration-500 ${
                    feedNinjaActive || isShellDark
                      ? 'bg-amber-500/10 border-amber-400/20'
                      : 'bg-amber-500/10 border-amber-400/20'
                  } ${isNewHighlight ? 'ring-2 ring-green-500/70 animate-pulse' : ''}`}
                >
                  {isNewHighlight && (
                    <span className="inline-flex items-center gap-1 mb-2 text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                      <Check size={10} />
                      Recién guardada
                    </span>
                  )}
                  <p
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      feedNinjaActive || isShellDark ? 'text-amber-300' : 'text-amber-600'
                    }`}
                  >
                    {note.date}
                  </p>
                  <p className={`text-sm mt-1.5 leading-snug ${feedNinjaActive || isShellDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {note.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDemoN3DetailPanel;