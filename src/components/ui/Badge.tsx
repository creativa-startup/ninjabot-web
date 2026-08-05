import React from 'react';

/**
 * Badge atómico con variantes enterprise.
 * Paleta: brand (gray-900), emerald, amber, rose, gray.
 * Aliases legacy: priority → rose, pending → amber, info → brand.
 *
 * Estética "UX/UI Card":
 *  - Fondos translúcidos (bg-*-500/10) y texto con opacidad /90.
 *  - Sin ring, sin bordes sólidos, sin sombras pesadas.
 *  - "gray" usa bg-black/5 text-gray-900/90 (regla estricta).
 *
 * Comportamiento:
 *  - count: estilo sólido (destacado) para contadores.
 *  - label/children: estilo suave translúcido para etiquetas.
 *  - dotOnly: punto de estado sin borde de color visible.
 */
export type BadgeCromaticType = 'priority' | 'pending' | 'info' | 'brand' | 'emerald' | 'amber' | 'rose' | 'gray';

interface BadgeProps {
  type?: BadgeCromaticType;
  count?: number | string;
  label?: string;
  dotOnly?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** Mapeo de variantes enterprise → clases sólidas (contadores / dot) */
const SOLID_STYLES: Record<BadgeCromaticType, string> = {
  brand: 'bg-brand text-white border-transparent',
  emerald: 'bg-emerald-500 text-white border-transparent',
  amber: 'bg-amber-500 text-white border-transparent',
  rose: 'bg-rose-500 text-white border-transparent',
  gray: 'bg-gray-900 text-white border-transparent',
  // Aliases legacy — mantienen compatibilidad con consumidores existentes
  priority: 'bg-rose-500 text-white border-transparent',
  pending: 'bg-amber-500 text-white border-transparent',
  info: 'bg-brand text-white border-transparent',
};

/** Mapeo de variantes enterprise → clases suaves translúcidas (etiquetas) */
const SOFT_STYLES: Record<BadgeCromaticType, string> = {
  brand: 'bg-brand text-white border-transparent',
  emerald: 'bg-emerald-500/10 text-emerald-700/90 border-transparent',
  amber: 'bg-amber-500/10 text-amber-700/90 border-transparent',
  rose: 'bg-rose-500/10 text-rose-700/90 border-transparent',
  gray: 'bg-black/5 text-gray-900/90 border-transparent',
  // Aliases legacy — mantienen compatibilidad con consumidores existentes
  priority: 'bg-rose-500/10 text-rose-700/90 border-transparent',
  pending: 'bg-amber-500/10 text-amber-700/90 border-transparent',
  info: 'bg-brand text-white border-transparent',
};

export const Badge: React.FC<BadgeProps> = ({
  type = 'info',
  count,
  label,
  dotOnly = false,
  className = '',
  children,
}) => {
  const isCount = count !== undefined;
  const cromaticStyles = isCount ? SOLID_STYLES[type] : SOFT_STYLES[type];

  const content = isCount ? (typeof count === 'number' && count > 99 ? '99+' : count) : label || children;

  if (dotOnly) {
    return (
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full border ${cromaticStyles} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full border leading-none transition-all duration-200 ${cromaticStyles} ${className}`}
    >
      {content}
    </span>
  );
};

export default Badge;