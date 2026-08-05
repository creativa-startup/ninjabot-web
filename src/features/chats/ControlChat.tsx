/**
 * @module ControlChat
 * @description Control de entidad Chat — acciones del módulo Chats.
 * Componente [Control] puro: botón icono de libreta (notas) y botón + (AddTrigger).
 * La libreta es estilo icono (pequeño, sin fondo) para contrastar con el AddTrigger grande azul.
 * Fondo transparente, alineado a la izquierda.
 */

import React from 'react';
import { Plus, StickyNote } from 'lucide-react';

export interface ControlChatProps {
  onOpenNotes: () => void;
  onOpenActions: () => void;
}

export const ControlChat: React.FC<ControlChatProps> = ({
  onOpenNotes,
  onOpenActions,
}) => {
  return (
    <div className="flex items-center justify-start gap-2 px-3 py-2 shrink-0 bg-transparent">
      {/* Botón + — AddTrigger enterprise (alineado con UI Kit) */}
      <button
        onClick={onOpenActions}
        className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-soft active:scale-95 transition-all duration-150 ease-out"
        title="Más acciones"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Botón icono libreta — estilo icono, pequeño, sin fondo */}
      <button
        onClick={onOpenNotes}
        className="w-8 h-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 flex items-center justify-center active:scale-95 transition-all duration-150 ease-out"
        title="Notas rápidas"
      >
        <StickyNote className="w-5 h-5 stroke-[1.8]" />
      </button>
    </div>
  );
};
