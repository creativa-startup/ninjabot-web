/**
 * @module ChatN3MessagesFeed
 * @description Cuerpo interno de contenido del panel N3 (Detail).
 * Componente [Detail] puro: renderiza el historial de mensajes del contacto.
 * No define tipos locales — todas las interfaces se importan de src/types.ts.
 */

import React, { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { SiWhatsapp, SiMessenger, SiInstagram } from 'react-icons/si';
import type { Contact, ActivePlatform } from '../../types';
import { NinjabotLogo } from '../../components/common/NinjabotLogo';

interface ChatN3MessagesFeedProps {
  contact: Contact;
  channel: ActivePlatform;
  isLoadingAi?: boolean;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <SiWhatsapp className="w-3 h-3" />,
  messenger: <SiMessenger className="w-3 h-3" />,
  instagram: <SiInstagram className="w-3 h-3" />,
};

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: 'bg-[#25D366]',
  messenger: 'bg-[#006AFF]',
  instagram: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
};

export const ChatN3MessagesFeed: React.FC<ChatN3MessagesFeedProps> = ({
  contact, channel, isLoadingAi = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contact.messages?.length, isLoadingAi]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
      {contact.messages?.map((msg) => {
        const isUser = msg.sender === 'user';
        const isAgent = msg.sender === 'agent';
        const platform = msg.channel && msg.channel !== 'ia' ? msg.channel : channel;
        return (
          <div key={msg.id} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
            <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl relative border font-sans ${
              isUser ? 'bg-white/80 backdrop-blur-md text-gray-900 rounded-tl-xs border-black/5'
              : isAgent ? 'bg-black/5 text-gray-900 rounded-tr-xs border-black/5'
              : 'bg-brand text-white rounded-tr-xs border-transparent'
            }`}>
              {isUser && (
                <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${PLATFORM_COLORS[platform] || 'bg-[#25D366]'}`}>
                  {PLATFORM_ICONS[platform] || <SiWhatsapp className="w-3 h-3" />}
                </div>
              )}
              {isAgent && (
                <div className="flex items-center gap-1 mb-1.5 text-[11px] font-bold text-gray-700">
                <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center overflow-hidden">
                    <NinjabotLogo variant="blanco" size="xs" />
                  </div>
                  <span>Ninjabot</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
              <span className="block text-[10px] text-gray-600 text-right mt-1 font-medium">{msg.timestamp}</span>
            </div>
          </div>
        );
      })}
      {isLoadingAi && (
        <div className="flex flex-col items-end">
          <div className="bg-black/5 px-4 py-2.5 rounded-2xl rounded-tr-xs border border-black/5 flex items-center gap-2">
            <Bot className="w-4 h-4 text-gray-700 animate-bounce" />
            <span className="text-xs text-gray-700 font-semibold animate-pulse">Ninjabot escribiendo...</span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};