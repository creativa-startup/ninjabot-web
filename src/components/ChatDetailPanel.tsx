import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Paperclip, ChevronDown, Check, Bot } from 'lucide-react';
import type { Contact, LeadStage } from '../types';

interface ChatDetailPanelProps {
  contact: Contact;
  onSendMessage: (text: string, isFromUser?: boolean) => void;
  onToggleAiAgent: (enabled: boolean) => void;
  onChangeLeadStage: (stage: LeadStage) => void;
  onBackClick?: () => void;
  showBackArrow?: boolean;
  isLoadingAi?: boolean;
}

const LEAD_STAGES: LeadStage[] = [
  'Lead Nuevo',
  'Contactado',
  'Interesado',
  'Cotización',
  'En negociación',
  'Cerrado',
  'Perdido',
];

export const ChatDetailPanel: React.FC<ChatDetailPanelProps> = ({
  contact,
  onSendMessage,
  onToggleAiAgent,
  onChangeLeadStage,
  onBackClick,
  showBackArrow = false,
  isLoadingAi = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [sendAsCustomer, setSendAsCustomer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contact.messages?.length, isLoadingAi]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), sendAsCustomer);
    setInputText('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#eaeaea] sm:bg-[#eeeeee] relative overflow-hidden select-none">
      {/* Header Bar */}
      <div className="bg-[#f2f2f2] border-b border-gray-300 px-3 sm:px-5 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-10">
        {/* Left: Back Arrow + Contact Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showBackArrow && (
            <button
              onClick={onBackClick}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-700 shrink-0"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <div className="min-w-0 flex flex-col">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
              {contact.name}
            </h2>
            <span className="text-xs text-gray-600 font-medium">
              {contact.phone}
            </span>
          </div>

          {/* Lead Stage Badge Dropdown */}
          <div className="relative ml-1 sm:ml-2">
            <button
              onClick={() => setShowStageDropdown(!showStageDropdown)}
              className="bg-[#c2ef40] hover:bg-[#b5e62e] text-black font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs transition-colors shrink-0"
            >
              <span>{contact.leadStage}</span>
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {showStageDropdown && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 text-xs">
                {LEAD_STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => {
                      onChangeLeadStage(stage);
                      setShowStageDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center justify-between font-medium text-gray-800"
                  >
                    <span>{stage}</span>
                    {contact.leadStage === stage && (
                      <Check className="w-3.5 h-3.5 text-black" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp Green Badge */}
          <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 ml-1 shadow-2xs">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.486 1.332 5.006L2 22l5.122-1.34A9.92 9.92 0 0 0 12.008 22c5.507 0 9.991-4.478 9.991-9.986 0-2.668-1.037-5.176-2.922-7.062A9.917 9.917 0 0 0 12.012 2z" />
            </svg>
          </div>
        </div>

        {/* Right: Agente IA Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs sm:text-sm font-semibold text-gray-800">
            Agente IA
          </span>

          <button
            onClick={() => onToggleAiAgent(!contact.aiAgentEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              contact.aiAgentEnabled ? 'bg-[#25D366]' : 'bg-gray-400'
            }`}
            title={`Toggle Agente IA (${contact.aiAgentEnabled ? 'Activado' : 'Desactivado'})`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                contact.aiAgentEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Conversation Thread Canvas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#ececec]">
        {contact.messages?.map((msg) => {
          const isUser = msg.sender === 'user';
          const isIA = msg.sender === 'ia';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? 'items-start' : 'items-end'
              }`}
            >
              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl relative shadow-2xs font-sans ${
                  isUser
                    ? 'bg-white text-gray-900 rounded-tl-xs'
                    : isIA
                    ? 'bg-[#d8d8d8] text-gray-900 rounded-tr-xs'
                    : 'bg-black text-white rounded-tr-xs'
                }`}
              >
                {/* Incoming User WhatsApp Badge */}
                {isUser && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3 h-3"
                    >
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.486 1.332 5.006L2 22l5.122-1.34A9.92 9.92 0 0 0 12.008 22c5.507 0 9.991-4.478 9.991-9.986 0-2.668-1.037-5.176-2.922-7.062A9.917 9.917 0 0 0 12.012 2z" />
                    </svg>
                  </div>
                )}

                {/* IA Robot Badge */}
                {isIA && (
                  <div className="flex items-center gap-1 mb-1 text-[11px] font-bold text-gray-700">
                    <Bot className="w-3.5 h-3.5 text-gray-800" />
                    <span>IA</span>
                  </div>
                )}

                {/* Message Text */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.text}
                </p>

                {/* Timestamp */}
                <span className="block text-[10px] text-gray-600 text-right mt-1 font-medium">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading AI thinking indicator */}
        {isLoadingAi && (
          <div className="flex flex-col items-end">
            <div className="bg-[#d8d8d8] px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-2xs flex items-center gap-2">
              <Bot className="w-4 h-4 text-gray-700 animate-bounce" />
              <span className="text-xs text-gray-700 font-semibold animate-pulse">
                Agente IA escribiendo...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-3 bg-[#f2f2f2] border-t border-gray-300 shrink-0">
        {/* Toggle to simulate customer vs manual agent response */}
        <div className="flex items-center justify-between mb-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Simular como:</span>
            <button
              onClick={() => setSendAsCustomer(false)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                !sendAsCustomer
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Agente / IA
            </button>
            <button
              onClick={() => setSendAsCustomer(true)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                sendAsCustomer
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cliente WhatsApp
            </button>
          </div>

          {contact.aiAgentEnabled && (
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Respuesta IA Activa
            </span>
          )}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Main White Rounded Input Pill */}
          <div className="flex-1 bg-white rounded-full px-4 py-2 border border-gray-300 shadow-2xs flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 shrink-0" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                sendAsCustomer
                  ? 'Escribe como cliente de WhatsApp...'
                  : 'Escribe un mensaje...'
              }
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-sm border-none outline-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoadingAi}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-md shrink-0 active:scale-95 ${
              inputText.trim() && !isLoadingAi
                ? 'bg-black hover:bg-gray-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </div>
  );
};
