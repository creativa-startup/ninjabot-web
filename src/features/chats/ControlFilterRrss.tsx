/**
 * @module ControlFilterRrss
 * @description Control de filtro expandible horizontal de redes sociales (Componente Puro).
 *
 * Regla de "Componentes Puros": este componente NO importa servicios, APIs ni Supabase.
 * Recibe únicamente por props: activeFilter (red activa) y onIntegrationClick (callback
 * hacia el orquestador padre indicando qué red se presionó).
 *
 * Estado local (aislamiento UI): `isExpanded` solo controla si la barra está plegada o
 * desplegada visualmente. Ninguna lógica de negocio vive aquí.
 *
 * Estructura visual:
 *   [ Todos (fijo, iluminado) ] [ Botón + / x ] -> (al expandir) [ WhatsApp ] [ Instagram ] [ Messenger ]
 *
 * - "Todos" se renderiza SIEMPRE en primera posición con icono representativo de Enviar (Send)
 *   e iluminado con el color corporativo.
 * - El botón circular (+) alterna el estado isExpanded y cambia su icono a (x) al expandir.
 * - Los 3 canales expandibles se renderizan en gris por defecto (disponibles, no seleccionados)
 *   y al hacer clic emiten onIntegrationClick(network) delegando la apertura de la integración
 *   al orquestador principal.
 * - Transición suave sin CLS: animación de ancho/opacidad (w-0 <-> w-auto) + transition-all duration-300 ease-in-out.
 */

import React, { useState } from 'react';
import { Send, Plus, X } from 'lucide-react';
import { SiWhatsapp, SiInstagram, SiMessenger } from 'react-icons/si';

export interface ControlFilterRrssProps {
  /** Red activa actual: 'all' | 'whatsapp' | 'instagram' | 'messenger' */
  activeFilter: string;
  /** Callback al orquestador padre: qué red fue presionada ('all' | 'whatsapp' | 'instagram' | 'messenger') */
  onIntegrationClick: (network: string) => void;
}

interface IntegrationButton {
  network: string;
  label: string;
  icon: React.ReactNode;
}

/** Canales expandibles — alineados con MessagingPlatform / ENTITY_ORDER */
const INTEGRATION_BUTTONS: IntegrationButton[] = [
  { network: 'whatsapp', label: 'WhatsApp', icon: <SiWhatsapp className="w-4 h-4" /> },
  { network: 'instagram', label: 'Instagram', icon: <SiInstagram className="w-4 h-4" /> },
  { network: 'messenger', label: 'Messenger', icon: <SiMessenger className="w-4 h-4" /> },
];

export const ControlFilterRrss: React.FC<ControlFilterRrssProps> = ({
  activeFilter,
  onIntegrationClick,
}) => {
  // Estado local de presentación — solo controla el plegado/desplegado visual
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-row items-center gap-2 px-3 py-2.5 shrink-0">
      {/* Botón fijo "Todos" — siempre primera posición, iluminado con el color corporativo */}
      <button
        onClick={() => onIntegrationClick('all')}
        title="Todos"
        aria-label="Todos"
        aria-current={activeFilter === 'all' ? 'true' : undefined}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shrink-0 active:scale-95 bg-brand text-white shadow-soft hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)]"
      >
        <Send className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {/* Botón trigger (+) — alterna el estado de expansión */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        title={isExpanded ? 'Cerrar' : 'Agregar canal'}
        aria-label={isExpanded ? 'Cerrar' : 'Agregar canal'}
        aria-expanded={isExpanded}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shrink-0 bg-black/5 text-gray-500/80 hover:bg-black/10 hover:text-gray-700 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] active:bg-black/15 active:scale-95"
      >
        {isExpanded ? <X size={14} strokeWidth={1.5} /> : <Plus size={14} strokeWidth={1.5} />}
      </button>

      {/* Canales expandibles — aparecen fluidamente a la derecha del botón (+) */}
      <div className="flex flex-row items-center overflow-hidden">
        {INTEGRATION_BUTTONS.map((btn) => (
          <div
            key={btn.network}
            className={`flex items-center transition-all duration-300 ease-in-out ${
              isExpanded
                ? 'w-auto opacity-100 scale-100'
                : 'w-0 opacity-0 scale-75 pointer-events-none'
            }`}
          >
            <button
              onClick={() => onIntegrationClick(btn.network)}
              title={`${btn.label} — integrar`}
              aria-label={`Integrar ${btn.label}`}
              className="relative flex items-center justify-center w-9 h-9 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shrink-0 bg-black/5 text-gray-500/80 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-black/10 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] active:bg-black/15 active:scale-95 mr-2"
            >
              {btn.icon}
              {/* Badge "+" — indica disponibilidad de integración */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-black/5 flex items-center justify-center text-[9px] font-medium text-gray-500/80 border border-white/70">
                +
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlFilterRrss;