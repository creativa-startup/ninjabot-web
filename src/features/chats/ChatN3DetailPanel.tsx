/**
 * @module ChatN3DetailPanel
 * @description Panel taxonómico N3 (Detail) del módulo Chats.
 * Layout jerárquico N3:
 *   1. ChatN3Header — cabecera taxonómica
 *   2. ChatN3MessagesFeed — cuerpo de mensajes del chat
 *   3. ControlChat — botones de acción (libreta + AddTrigger) que abren N4
 *   4. InputArea — footer con input y botón enviar
 * Componente [Panel] puro: recibe datos y callbacks por props.
 * No define tipos locales — todas las interfaces se importan de src/types.ts.
 */

import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import type { Contact, LeadStage, LeadTemperatureLevel, ActivePlatform } from '../../types';
import { ChatN3Header } from './ChatN3Header';
import { ChatN3MessagesFeed } from './ChatN3MessagesFeed';
import { ControlChat } from './ControlChat';

export interface ChatN3DetailPanelProps {
  contact: Contact;
  /** Default: 3 (Lead Templado) — requerido por ChatsFeature, opcional por compatibilidad */
  tempLevel?: LeadTemperatureLevel;
  /** Default: 'whatsapp' — requerido por ChatsFeature, opcional por compatibilidad */
  channel?: ActivePlatform;
  onSendMessage?: (text: string, isFromUser?: boolean) => void;
  onToggleAiAgent: (enabled: boolean) => void;
  onChangeLeadStage?: (stage: LeadStage) => void;
  onBackClick?: () => void;
  showBackArrow?: boolean;
  isLoadingAi?: boolean;
  onOpenSaleModal?: () => void;
  capiActive?: boolean;
  /** Callback para abrir N4 desde AddTrigger (+) — N4 con "Cerrar" */
  onOpenN4Actions?: () => void;
  /** Callback para abrir N4 desde libreta (📋) — N4 con "Volver" */
  onOpenN4Notes?: () => void;
  /** Callback para integrar catálogos de Meta */
  onIntegrateCatalog?: () => void;
}

export const ChatN3DetailPanel: React.FC<ChatN3DetailPanelProps> = ({
  contact, tempLevel = 3, channel = 'whatsapp', onSendMessage, onToggleAiAgent,
  onBackClick, showBackArrow = false, isLoadingAi = false,
  onOpenN4Actions, onOpenN4Notes, onIntegrateCatalog,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage?.(inputText.trim(), false);
    setInputText('');
  };

  return (
    <div className="w-full h-full flex flex-col panel-n3-clean relative overflow-hidden select-none">
      {/* 1. ChatN3Header — cabecera taxonómica */}
      <ChatN3Header
        contact={contact}
        tempLevel={tempLevel}
        channel={channel}
        showBackArrow={showBackArrow}
        onBackClick={onBackClick}
        onToggleAiAgent={onToggleAiAgent}
        onIntegrateCatalog={onIntegrateCatalog}
      />

      {/* 2. ChatN3MessagesFeed — cuerpo de mensajes del chat */}
      <ChatN3MessagesFeed
        contact={contact}
        channel={channel}
        isLoadingAi={isLoadingAi}
      />

      {/* 3. ControlChat — + (AddTrigger) abre N4 con "Cerrar", libreta (📋) abre N4 con "Volver" */}
      <ControlChat
        onOpenNotes={() => onOpenN4Notes?.()}
        onOpenActions={() => onOpenN4Actions?.()}
      />

      {/* 4. InputArea — footer con input y botón enviar */}
      <div className="shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3">
          <div className="flex-1 bg-black/5 rounded-full px-4 py-2 border border-black/5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-gray-900/20 transition-shadow">
            <Paperclip className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 shrink-0" />
            <input type="text" id="chat-message-input" name="chatMessage" value={inputText} onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-sm border-none outline-none font-medium" />
          </div>
          <button type="submit" disabled={!inputText.trim() || isLoadingAi}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.03)] shrink-0 active:scale-95 ${
              inputText.trim() && !isLoadingAi ? 'bg-brand hover:bg-gray-800 active:bg-gray-700' : 'bg-black/5 cursor-not-allowed'
            }`} title="Enviar mensaje">
            <Send className="w-4 h-4 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </div>
  );
};