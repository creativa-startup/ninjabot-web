/**
 * @module ChatN2Header
 * @description Header taxonómico N2 del módulo Chats.
 * Título dinámico que responde al viewMode activo y contador total de no leídos.
 * Jerarquía Premium: título font-medium con opacidad /90 + contador opacidad /70
 * (jerarquía tipográfica por opacidad, sin fontWeight excesivos).
 *
 * Migrado a usar FeedViewMode (chats | posts) en lugar de FilterMode para
 * alinearse con la nueva taxonomía.
 */

import React from 'react';
import type { PlatformFilter, FilterMode } from '../../types';
import { FILTER_MODE_MAP } from '../../types';

interface ChatN2HeaderProps {
  totalConversations: number;
  activePlatform?: PlatformFilter;
  /** viewMode: 'conversaciones' | 'social_feed' (se mapea internamente a FeedViewMode) */
  viewMode?: FilterMode;
}

const TITLE_MAP: Record<string, string> = {
  chats: 'Conversaciones',
  posts: 'Feed Social',
  all: 'Chats',
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  instagram: 'Instagram',
  ninjabot: 'Ninjabot',
};

export const ChatN2Header: React.FC<ChatN2HeaderProps> = ({ totalConversations, activePlatform = 'all', viewMode = 'conversaciones' }) => {
  // Convertir FilterMode a FeedViewMode para el título
  const feedView = FILTER_MODE_MAP[viewMode];

  // Si hay una plataforma específica activa, mostrar el título de la plataforma
  // Si no, mostrar el título según el modo de vista
  const title = activePlatform !== 'all' ? TITLE_MAP[activePlatform] : TITLE_MAP[feedView];

  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <h2 className="text-sm font-medium text-gray-900/90 leading-tight truncate">{title}</h2>
      <span className="text-xs text-gray-500/70 shrink-0 tabular-nums">
        {totalConversations}
      </span>
    </div>
  );
};