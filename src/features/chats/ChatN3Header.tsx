/**
 * @module ChatN3Header
 * @description Header taxonómico del panel N3 (Detail).
 * Componente [Header] puro: recibe datos por props, emite callbacks.
 * Jerarquía enterprise: fondo blanco translúcido + borde sutil, nombre
 * font-semibold, teléfono font-medium. Estados interactivos claros.
 * Actualizado para usar ActivePlatform (incluye 'ninjabot').
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SiWhatsapp, SiMessenger, SiInstagram, SiMeta } from 'react-icons/si';
import type { Contact, LeadTemperatureLevel, ActivePlatform } from '../../types';
import { LeadTemperatureMeter } from '../../components/ui/LeadTemperatureMeter';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Avatar } from '../../components/ui/Avatar';

const CHANNEL_BG: Record<string, string> = {
  ninjabot: 'bg-brand',
  whatsapp: 'bg-emerald-500',
  messenger: 'bg-blue-600',
  instagram: 'bg-rose-500',
};

export interface ChatN3HeaderProps {
  contact: Contact;
  tempLevel: LeadTemperatureLevel;
  channel: ActivePlatform;
  showBackArrow?: boolean;
  onBackClick?: () => void;
  onToggleAiAgent: (enabled: boolean) => void;
  onIntegrateCatalog?: () => void;
}

export const ChatN3Header: React.FC<ChatN3HeaderProps> = ({
  contact, tempLevel, channel, showBackArrow = false,
  onBackClick, onToggleAiAgent, onIntegrateCatalog,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md dark:bg-transparent px-3 sm:px-5 py-2 flex items-center gap-2 min-w-0">
      {showBackArrow && onBackClick && (
        <button onClick={onBackClick} className="p-1 hover:bg-black/5 active:bg-black/10 rounded-full transition-colors text-gray-700 shrink-0 md:hidden" title="Volver">
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* LeadTemperatureMeter + Avatar — solo mobile */}
      <div className="flex items-center gap-1 shrink-0 sm:hidden">
        <div className="self-stretch flex items-center">
          <LeadTemperatureMeter level={tempLevel} />
        </div>
        <div className="relative flex-shrink-0">
          <Avatar
            src={contact.avatar}
            fallback={(contact.name || 'N').charAt(0).toUpperCase()}
            size="sm"
          />
          <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full text-white ${CHANNEL_BG[channel] || 'bg-brand'}`}>
            {channel === 'whatsapp' && <SiWhatsapp className="w-2.5 h-2.5" />}
            {channel === 'messenger' && <SiMessenger className="w-2.5 h-2.5" />}
            {channel === 'instagram' && <SiInstagram className="w-2.5 h-2.5" />}
            {channel === 'ninjabot' && <span className="w-2.5 h-2.5 flex items-center justify-center text-[7px] font-bold text-white">N</span>}
          </div>
        </div>
      </div>

      {/* Nombre + Teléfono a la izquierda */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm leading-tight truncate">{contact.name}</h2>
          {/* Trazabilidad: entidad de origen del contacto en la cabecera del chat */}
          <SourceBadge
            source={contact.originPlatform || contact.platform || 'ninjabot'}
            variant="compact"
            className="shrink-0"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">{contact.phone}</span>
      </div>

      {/* Botón Integrar Catálogos Meta */}
      {onIntegrateCatalog && (
        <button onClick={onIntegrateCatalog}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-colors shrink-0">
          <SiMeta className="w-3.5 h-3.5" />
          <span>Catálogos</span>
        </button>
      )}

      {/* IA Toggle — visible en mobile y desktop */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] font-semibold text-gray-700">IA</span>
        <button onClick={() => onToggleAiAgent(!contact.aiAgentEnabled)}
          className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
            contact.aiAgentEnabled ? 'bg-emerald-500' : 'bg-black/10 hover:bg-black/20'
          }`}
          title={`Toggle Agente IA (${contact.aiAgentEnabled ? 'Activado' : 'Desactivado'})`}>
          <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${contact.aiAgentEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );
};