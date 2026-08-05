/**
 * @module ChatN2FeedCard
 * @description Tarjeta de chat/DM para el feed del panel N2.
 * Componente [Detail/Item] memoizado: avatar con iniciales del contacto,
 * badge de plataforma SIEMPRE visible (fallback a 'ninjabot' si no hay
 * platform explícita), badges de no leídos y timestamps.
 *
 * Estética enterprise: estados interactivos claros (hover/active/selected),
 * tipografía jerarquizada (font-medium nombre / font-normal preview).
 *
 * Identidad Única: el badge de plataforma muestra el canal activo
 * o 'ninjabot' para contactos nativos de la plataforma web.
 *
 * Optimización: React.memo con comparador personalizado para evitar
 * re-renderizados innecesarios.
 */

import React from 'react';
import { SiWhatsapp, SiMessenger, SiInstagram } from 'react-icons/si';
import type { Contact } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Avatar } from '../../components/ui/Avatar';

export interface ChatN2FeedCardProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
}

/** Icono de Ninjabot (canal nativo) */
const NinjabotIcon = (
  <span className="w-3.5 h-3.5 flex items-center justify-center text-[9px] bg-brand text-white rounded-full font-bold leading-none">
    N
  </span>
);

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  ninjabot:  NinjabotIcon,
  whatsapp:  <SiWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />,
  messenger: <SiMessenger className="w-3.5 h-3.5 text-[#006AFF]" />,
  instagram: <SiInstagram className="w-3.5 h-3.5 text-[#DD2A7B]" />,
};

const ChatN2FeedCardComponent: React.FC<ChatN2FeedCardProps> = ({ contact, isSelected, onSelect }) => {
  // Fallback: si no hay platform, asumir 'ninjabot' (nativo de la plataforma)
  const platform = contact.platform ?? 'ninjabot';

  return (
    <div
      onClick={onSelect}
      className={`relative p-3 cursor-pointer transition-colors flex gap-3 items-center group ${
        isSelected
          ? 'bg-black/5 font-medium'
          : 'hover:bg-black/5 active:bg-black/10'
      }`}
    >
      {/* Avatar estandarizado + badge de plataforma (contenedor relative padre intacto) */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={contact.avatar}
          fallback={(contact.name || 'N').charAt(0).toUpperCase()}
          size="md"
        />
        {/* Badge de plataforma SIEMPRE visible (esquina inferior derecha del avatar) */}
        {platform && (
          <span className="absolute -bottom-0.5 -right-0.5">
            {PLATFORM_ICONS[platform] || NinjabotIcon}
          </span>
        )}
      </div>

      {/* Contenido textual */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">{contact.name}</h4>
            {/* Trazabilidad: badge de fuente nativa/Google junto al nombre */}
            <SourceBadge
              source={contact.originPlatform || contact.platform || 'ninjabot'}
              variant="compact"
              className="shrink-0"
            />
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[11px] text-gray-500 font-medium">{contact.lastTime}</span>
            {(contact.unreadCount ?? 0) > 0 && (
              <Badge
                type="rose"
                count={contact.unreadCount! > 99 ? '99+' : contact.unreadCount}
                className="z-10"
              />
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate">{contact.lastMessage || 'Sin mensajes'}</p>
      </div>
    </div>
  );
};

/**
 * Comparador personalizado para React.memo.
 * Revisa campos críticos y los nuevos campos omnicanal.
 */
const arePropsEqual = (prev: ChatN2FeedCardProps, next: ChatN2FeedCardProps): boolean => {
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.contact.unreadCount !== next.contact.unreadCount) return false;
  if (prev.contact.lastMessage !== next.contact.lastMessage) return false;
  if (prev.contact.lastTime !== next.contact.lastTime) return false;
  if (prev.contact.name !== next.contact.name) return false;
  if (prev.contact.platform !== next.contact.platform) return false;
  if (prev.contact.originPlatform !== next.contact.originPlatform) return false;
  if (prev.contact.linkedPlatforms?.length !== next.contact.linkedPlatforms?.length) return false;
  return true;
};

export const ChatN2FeedCard = React.memo(ChatN2FeedCardComponent, arePropsEqual);

export default ChatN2FeedCard;