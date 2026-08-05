import React from 'react';
import { Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

interface ThemeToggleProps {
  /** Estilo flotante para superponerse sobre cualquier fondo (onboarding/login). */
  variant?: 'default' | 'floating';
  className?: string;
}

/**
 * ThemeToggle — Botón minimalista que alterna el tema global.
 * Muestra solo una luna: negra en modo claro, blanca en modo oscuro.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'default',
  className = '',
}) => {
  const { isDark, toggleTheme } = useTheme();

  const baseClass = [
    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
    'transition-colors duration-200',
    variant === 'default'
      ? isDark
        ? 'text-white hover:bg-neutral-800'
        : 'text-slate-900 hover:bg-slate-100'
      : isDark
        ? 'text-white bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'
        : 'text-slate-900 bg-white/90 backdrop-blur border border-slate-200 shadow-sm hover:bg-white',
    className,
  ].join(' ');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo oscuro' : 'Modo claro'}
      className={baseClass}
    >
      <Moon
        className={`w-5 h-5 transition-colors duration-200 ${isDark ? 'fill-white/20' : 'fill-slate-900/10'}`}
        strokeWidth={2}
      />
    </button>
  );
};