/**
 * @module ChatDemoN2ListPanel
 * @description Panel taxonómico N2 (List) del módulo Chats — versión Demo/Prototipo.
 * Encapsula el código inline que vivía en LayoutDemo.tsx (Estados Rápidos,
 * Filtro de RRSS, Lista de Chats, Tendencias Feed Ninja y Story Viewer).
 *
 * Header N2 con título estático dinámico:
 *   - Modo Timeline normal: "Empieza con un Jazs".
 *   - Modo Ninja: Panel N2 completamente vacío (limpio).
 *
 * Modo Ninja (feedNinjaActive):
 *   - Activación global desde el Sidebar N1 (ícono Zap) — no desde este panel.
 *   - Layout 100% transparente: hereda el token --panel-n2 (#171717) del
 *     wrapper para mantener la inmersión del color base sin romper la jerarquía.
 *   - NO renderiza NADA — panel completamente limpio/vacío. Sin botones,
 *     sin formularios, sin tendencias, sin historias, sin feed.
 *
 * Story Viewer (activeStory):
 *   - Overlay inmersivo de cristal (bg-[#0a0a0f]/90 + backdrop-blur-2xl).
 *   - Sin bordes sólidos: separadores translúcidos (white/10, black/5).
 *   - Jerarquía tipográfica por opacidad — sin font-bold/font-extrabold.
 *
 * El panel N2 permanece vacío en el Modo Ninja — el contenido se delega
 * exclusivamente al panel N3 (ChatDemoN3DetailPanel / Feed).
 *
 * Taxonomía: [Domain]N[Level][Type]Panel → Chats + N2 + List + Panel
 * Principio de Layout Decoupling: el panel recibe estado y callbacks por props;
 * el orquestador (LayoutDemo) mantiene el estado global del shell.
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Send,
} from 'lucide-react';
import {
  STATUS_ITEMS,
  FILTER_ITEMS,
  CHAT_CARDS,
  CHANNEL_ICONS,
} from './mockChats';
import { Avatar } from '../../components/ui/Avatar';

export interface ChatDemoN2ListPanelProps {
  /** Modo oscuro del shell demo */
  isShellDark?: boolean;
  /** Modo Feed Ninja activo (tendencias en lugar de lista de chats) */
  feedNinjaActive?: boolean;
  /** Visor de historias overlay activo */
  activeStory?: boolean;
  /** Callback al seleccionar un chat de la lista */
  onSelectChat: (chatId: string) => void;
  /** Callback al activar/cerrar el visor de historias */
  onSetActiveStory?: (active: boolean) => void;
}

export const ChatDemoN2ListPanel: React.FC<ChatDemoN2ListPanelProps> = ({
  isShellDark = false,
  feedNinjaActive = false,
  activeStory = false,
  onSelectChat,
  onSetActiveStory,
}) => {
  /* Estado local de búsqueda — filtra la lista de chats demo en tiempo real */
  const [searchQuery, setSearchQuery] = useState('');

  /* Filtrado simple de la lista de chats por nombre o preview */
  const filteredChats = CHAT_CARDS.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      chat.name.toLowerCase().includes(q) ||
      chat.preview.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`w-full h-full flex flex-col relative overflow-hidden select-none panel-n2-clean transition-colors duration-500 ${
        feedNinjaActive
          ? 'bg-transparent text-white'
          : isShellDark
            ? 'text-white'
            : 'text-gray-900'
      }`}
      style={!feedNinjaActive && isShellDark ? { backgroundColor: 'var(--panel-n2)' } : undefined}
    >
      {feedNinjaActive ? (
        /* ═══ MODE NINJA — Panel completamente limpio/vacío ═══ */
        <div className="flex-1 w-full h-full" />
      ) : (
        <>
          {/* 2. Input de búsqueda ultra-limpio (filtra la lista de chats) */}
          <div
            className={`px-3 py-2.5 flex-shrink-0 transition-colors duration-500 ${
              isShellDark ? 'bg-transparent' : 'bg-white/80'
            }`}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar Ninjazs o chats..."
              className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-sm text-title placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-brand/50 transition-all"
            />
          </div>

          {/* 3. Filtro de RRSS */}
          <div
            className={`flex items-center gap-2 p-3 flex-shrink-0 overflow-x-auto hide-scrollbar transition-colors duration-500 ${
              isShellDark ? 'bg-transparent border-white/5' : 'bg-black/5 border-black/5'
            }`}
          >
            {FILTER_ITEMS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  filter.active
                    ? isShellDark
                      ? 'bg-white/10 text-white'
                      : 'bg-black/5 text-gray-900/90'
                    : isShellDark
                      ? 'bg-white/5 border border-white/10 text-gray-400/80 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)]'
                      : 'bg-white/60 border border-black/5 text-gray-500/80 hover:bg-black/5 hover:text-gray-700 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* 4. Lista de Tarjetas de Chat (scrollable) */}
          <div
            className={`flex-1 overflow-y-auto flex flex-col transition-colors duration-500 ${
              isShellDark ? 'bg-transparent' : 'bg-transparent'
            }`}
          >
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <p className={`text-sm font-medium ${isShellDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No se encontraron chats
                </p>
                <p className={`text-xs mt-1 ${isShellDark ? 'text-gray-500/70' : 'text-gray-400'}`}>
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => {
              const channelMeta = CHANNEL_ICONS[chat.channel];
              const ChannelIcon = channelMeta.Icon;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    isShellDark
                      ? 'hover:bg-white/5'
                      : 'hover:bg-black/5'
                  }`}
                >
                  {/* Izquierda: Avatar estándar con sello de entidad + punto activo */}
                  <span className="relative flex-shrink-0">
                    <Avatar
                      fallback={chat.name.charAt(0).toUpperCase()}
                      size="md"
                    />
                    <span className="absolute bottom-0 right-0">
                      <span
                        className={`relative w-4 h-4 rounded-full flex items-center justify-center ${
                          isShellDark ? 'bg-[#151515]' : 'bg-white/80'
                        }`}
                      >
                        <ChannelIcon size={10} color={channelMeta.color} />
                        <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 border-2 border-white/70" />
                      </span>
                    </span>
                  </span>

                  {/* Centro: Info */}
                  <span className="flex-1 min-w-0 flex flex-col justify-center">
                    <span
                      className={`font-medium text-sm truncate ${
                        isShellDark ? 'text-white/90' : 'text-gray-900/90'
                      }`}
                    >
                      {chat.name}
                    </span>
                    <span
                      className={`text-sm truncate ${
                        isShellDark ? 'text-gray-400/80' : 'text-gray-500/80'
                      }`}
                    >
                      {chat.preview}
                    </span>
                  </span>

                  {/* Derecha: Meta */}
                  <span className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`text-xs ${
                        isShellDark ? 'text-gray-500/70' : 'text-gray-400/70'
                      }`}
                    >
                      {chat.time}
                    </span>
                    {chat.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-medium flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
            )}
          </div>
        </>
      )}

      {/* ═══ Visor de Historias (Story Viewer) — overlay inmersivo de cristal ═══ */}
      {activeStory && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-2xl flex flex-col animate-slide-in-right">
          {/* Barra de progreso segmentada — sin bordes */}
          <div className="flex gap-1 p-3 pb-0">
            {STATUS_ITEMS.map((s) => (
              <div key={s.id} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-white" />
              </div>
            ))}
          </div>

          {/* Header: cerrar + avatar + nombre + hora */}
          <div className="flex items-center gap-3 p-3">
            <button
              type="button"
              onClick={() => onSetActiveStory?.(false)}
              title="Cerrar historia"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <span className="p-[2px] rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex-shrink-0">
              <Avatar
                fallback="M"
                size="md"
                className="border-2 border-[#0a0a0f]/90"
              />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">María Fernanda</p>
              <p className="text-xs text-gray-400/60">hace 2 horas</p>
            </div>
          </div>

          {/* Contenido inmersivo de la historia */}
          <div className="flex-1 mx-3 rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-900 relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="text-3xl font-medium text-white/95 leading-tight">¡Nuevo lanzamiento! 🚀</p>
              <p className="text-sm text-white/70 mt-3">Social Commerce está aquí</p>
            </div>
          </div>

          {/* Footer: reacciones + responder */}
          <div className="flex items-center gap-3 p-4">
            <button
              type="button"
              title="Me gusta"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300"
            >
              <Heart size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              title="Comentar"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300"
            >
              <MessageCircle size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              title="Compartir"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300"
            >
              <Send size={18} strokeWidth={1.5} />
            </button>
            <input
              type="text"
              placeholder="Responder a esta historia..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-white placeholder:text-gray-500/60"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatDemoN2ListPanel;