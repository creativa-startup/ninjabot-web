/**
 * @module ChatN2ListPanel
 * @description Panel taxonómico N2 (List) del módulo Chats.
 * Componente [Panel] puro: recibe datos y callbacks por props.
 * No contiene lógica de estado ni llamadas a API directas.
 *
 * Taxonomía interna:
 *   [Panel]   → ChatN2ListPanel (contenedor responsivo)
 *   [Header]  → ChatN2Header (título dinámico + contador + botón crear post)
 *   [Control] → ControlFilterRrss (buscador + filtro inteligente de Entidades de Origen)
 *   [List]    → ChatN2List (feed polimórfico: chats DMs / posts RRSS)
 *
 * Responsive: w-full md:w-[360px] lg:w-[400px] flex-shrink-0 border-r
 * Estética enterprise: fondo neutro, bordes sutiles, jerarquía tipográfica clara.
 */

import React from 'react';
import { PenSquare, X } from 'lucide-react';
import type { Contact, PlatformFilter, FilterMode, EntityFilter } from '../../types';
import type { SocialPost } from './types';
import { ChatN2Header } from './ChatN2Header';
import { ControlFilterRrss } from './ControlFilterRrss';
import { ChatN2List } from './ChatN2List';
import { FeedPanelNinja, type TrendItem } from './FeedPanelNinja';

export interface ChatN2ListPanelProps {
  // Chats
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  // Posts
  posts?: SocialPost[];
  onSelectPost?: (post: SocialPost) => void;
  /** Callback al hacer clic en el autor de un post → navegación a /@handle */
  onAuthorClick?: (post: SocialPost) => void;
  // View mode
  viewMode: FilterMode;
  onViewModeChange: (mode: FilterMode) => void;
  // Filtro inteligente de Entidades de Origen
  activeEntity: EntityFilter;
  onFilterChange: (entity: EntityFilter) => void;
  // Filtros de búsqueda
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Filtro de plataforma efectivo para la lista (derivado por el orquestador)
  activePlatform: PlatformFilter;
  // Canales externos integrados (whatsapp/instagram/messenger) para el filtro Rrss
  connectedPlatforms?: string[];
  onIntegratePlatform?: (platform: string) => void;
  /** Handle del usuario actual (sin @) para el empty state viral — /@handle */
  currentUserHandle?: string;
  // Feed Ninja
  /** Indica si el modo Feed Ninja está activo (paneles de categorías/layout visibles) */
  feedNinjaActive?: boolean;
  /** Callback al presionar el botón lápiz (alternar modo Feed Ninja) */
  onToggleFeedNinja?: () => void;
  /** Callback al presionar el link "feed" (actualizar feed) */
  onRefreshFeed?: () => void;
  // Feed Ninja — Tendencias
  /** Lista de tendencias para el panel N2 */
  trends?: TrendItem[];
  /** Hashtag activo seleccionado (null = todas las tendencias) */
  activeHashtag?: string | null;
  /** Callback al hacer clic en una tendencia */
  onSelectHashtag?: (tag: string) => void;
  // Loading / Error
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const ChatN2ListPanel: React.FC<ChatN2ListPanelProps> = ({
  contacts,
  activeContactId,
  onSelectContact,
  posts,
  onSelectPost,
  onAuthorClick,
  viewMode,
  onViewModeChange: _onViewModeChange,
  activeEntity: _activeEntity,
  onFilterChange,
  searchQuery,
  onSearchChange,
  activePlatform,
  onIntegratePlatform,
  currentUserHandle,
  feedNinjaActive = false,
  onToggleFeedNinja,
  onRefreshFeed,
  trends,
  activeHashtag,
  onSelectHashtag,
  isLoading = false,
  errorMessage = null,
  onRetry,
}) => {
  const totalConversations = contacts.length;

  /**
   * Handler de redes presionadas en el ControlFilterRrss (componente puro).
   * - 'all' → resetea el filtro de entidad (Todos).
   * - whatsapp/instagram/messenger → delega la integración al orquestador padre.
   */
  const handleIntegrationClick = (network: string) => {
    if (network === 'all') {
      onFilterChange('all');
      return;
    }
    onIntegratePlatform?.(network);
  };

  return (
    <div className="w-full md:w-[360px] lg:w-[400px] flex-shrink-0 panel-n2-clean h-full flex flex-col select-none overflow-hidden">
      {/* Módulo 1: Header con título dinámico + contador + botón feed */}
      <div className="px-3 py-2 shrink-0 flex items-center justify-between gap-2">
        <ChatN2Header
          totalConversations={totalConversations}
          activePlatform={activePlatform}
          viewMode={viewMode}
        />
        {/* Botón feed — siempre visible, alterna modo Feed Ninja */}
        <button
          onClick={onToggleFeedNinja}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 ${
            feedNinjaActive
              ? 'bg-black/5 text-gray-600 hover:bg-black/10'
              : 'bg-brand text-white hover:bg-fuchsia-600 active:bg-fuchsia-700'
          }`}
          title={feedNinjaActive ? 'Cerrar Feed Ninja' : 'Abrir Feed Ninja'}
        >
          {feedNinjaActive ? <X size={15} strokeWidth={1.5} /> : <PenSquare size={15} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Módulo 2: Input de búsqueda ultra-limpio (filtra la lista de chats/posts) */}
      <div className="px-3 py-2.5 shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar Ninjazs o chats..."
          className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-sm text-title placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-brand/50 transition-all"
        />
      </div>

      {/* Módulo 3: Control de integraciones horizontal colapsable (componente puro) */}
      <ControlFilterRrss
        activeFilter={activePlatform}
        onIntegrationClick={handleIntegrationClick}
      />

      {/* Módulo 4: Contenido dinámico (Feed Ninja activo → FeedPanelNinja, si no → lista) */}
      {feedNinjaActive ? (
        <FeedPanelNinja
          trends={trends}
          activeHashtag={activeHashtag}
          onSelectHashtag={onSelectHashtag}
          onRefreshFeed={onRefreshFeed}
        />
      ) : (
        <ChatN2List
          contacts={contacts}
          posts={posts}
          viewMode={viewMode}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={onRetry}
          searchQuery={searchQuery}
          activePlatform={activePlatform}
          currentUserHandle={currentUserHandle}
          activeContactId={activeContactId}
          onSelectContact={onSelectContact}
          onSelectPost={onSelectPost}
          onAuthorClick={onAuthorClick}
        />
      )}
    </div>
  );
};

export default ChatN2ListPanel;