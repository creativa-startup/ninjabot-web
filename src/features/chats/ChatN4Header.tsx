/**
 * @module ChatN4Header
 * @description Header taxonómico del panel N4 (SubDetail Overlay).
 * Componente [Header] puro: título estándar con acción de retorno/cierre.
 * Jerarquía enterprise: título font-semibold, acción font-medium con
 * estados hover/active claros.
 * Dos variantes: 'back' (← Volver) o 'close' (X Cerrar).
 *
 * Layout:
 *   [← Volver] [Título]   → variant="back"
 *   [X Cerrar]  [Título]   → variant="close"
 */

import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

export type ChatN4HeaderSize = 'sm' | 'md' | 'lg';

export interface ChatN4HeaderProps {
  title?: string;
  onBack: () => void;
  variant?: 'back' | 'close';
  size?: ChatN4HeaderSize;
}

const SIZE_MAP: Record<ChatN4HeaderSize, { container: string; icon: string; text: string }> = {
  sm: { container: 'px-3 py-2 gap-2', icon: 'w-3.5 h-3.5', text: 'text-xs' },
  md: { container: 'px-4 py-3 gap-3', icon: 'w-4 h-4', text: 'text-sm' },
  lg: { container: 'px-6 py-4 gap-4', icon: 'w-5 h-5', text: 'text-base' },
};

export const ChatN4Header: React.FC<ChatN4HeaderProps> = ({
  title = 'Sub-Detalle',
  onBack,
  variant = 'back',
  size = 'md',
}) => {
  const s = SIZE_MAP[size];
  return (
    <div className={`flex items-center ${s.container} shrink-0 bg-white/80 dark:bg-transparent backdrop-blur-md`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-1.5 text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors font-medium ${s.text}`}
      >
        {variant === 'back' ? (
          <>
            <ArrowLeft className={`${s.icon} stroke-[2.5]`} />
            Volver
          </>
        ) : (
          <>
            <X className={`${s.icon} stroke-[2.5]`} />
            Cerrar
          </>
        )}
      </button>
      <span className={`font-semibold text-gray-900 truncate ${s.text}`}>{title}</span>
    </div>
  );
};