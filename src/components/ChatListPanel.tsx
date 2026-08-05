/**
 * @module ChatListPanel
 * @description Wrapper adaptador para compatibilidad con legacy App.tsx (móvil).
 * Convierte props antiguas (setSearchQuery) a las props nuevas de ChatN2ListPanel.
 * @deprecated Usar ChatN2ListPanel directamente.
 */

import React from 'react';
import type { Contact, MessagingPlatform, PlatformFilter, PlatformConnection, EntityFilter } from '../types';
import { ChatN2ListPanel } from "../features/chats/ChatN2ListPanel";

export interface ChatListPanelProps {
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  searchQuery: string;
  setSearchQuery?: (query: string) => void;
  onSearchChange?: (query: string) => void;
  /** Compat legacy — la integración de canales ya no vive en el filtro de N2 */
  platformStatus?: Record<string, PlatformConnection>;
  onConnectPlatform?: (platform: MessagingPlatform) => void;
  onPlatformChange?: (filter: PlatformFilter) => void;
  activePlatform?: PlatformFilter;
  /** Filtro inteligente de Entidades de Origen (nuevo contrato del control N2) */
  activeEntity?: EntityFilter;
  onFilterChange?: (entity: EntityFilter) => void;
  viewMode?: 'conversaciones' | 'social_feed';
  onViewModeChange?: (mode: 'conversaciones' | 'social_feed') => void;
  posts?: any[];
  onSelectPost?: (post: any) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const ChatListPanel: React.FC<ChatListPanelProps> = ({
  contacts,
  activeContactId,
  onSelectContact,
  searchQuery,
  setSearchQuery,
  onSearchChange,
  platformStatus,
  onConnectPlatform,
  activePlatform = 'all',
  // Fuente nativa por defecto: el móvil muestra [ Todos ] [ Ninjabot ] [ + ]
  activeEntity = 'ninjabot',
  onFilterChange,
  viewMode = 'conversaciones',
  onViewModeChange,
  posts,
  onSelectPost,
  isLoading = false,
  errorMessage = null,
  onRetry,
}) => {
  // Resolver el handler de change: usar onSearchChange si existe, de lo contrario setSearchQuery
  const handleSearchChange = onSearchChange || setSearchQuery || (() => {});

  // Resolver el handler del filtro de entidades (noop si no se provee — legacy)
  const handleFilterChange = onFilterChange || (() => {});

  // Resolver el handler de view mode
  const handleViewModeChange = onViewModeChange || (() => {});

  // Derivar canales conectados desde platformStatus (para el filtro Rrss del móvil)
  const connectedPlatforms: string[] = Object.entries(platformStatus ?? {})
    .filter(([_, status]) => status === 'connected')
    .map(([platform]) => platform);

  const handleIntegratePlatform = (platform: string) => {
    onConnectPlatform?.(platform as MessagingPlatform);
  };

  return (
    <ChatN2ListPanel
      contacts={contacts}
      activeContactId={activeContactId}
      onSelectContact={onSelectContact}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      activeEntity={activeEntity}
      onFilterChange={handleFilterChange}
      activePlatform={activePlatform}
      connectedPlatforms={connectedPlatforms}
      onIntegratePlatform={handleIntegratePlatform}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      posts={posts}
      onSelectPost={onSelectPost}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={onRetry}
    />
  );
};

export default ChatListPanel;