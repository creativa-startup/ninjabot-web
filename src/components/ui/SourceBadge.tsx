/**
 * @module SourceBadge
 * @description Badge de trazabilidad: muestra la entidad de origen de un contacto.
 * Distingue visualmente:
 *   - 'ninjabot'   → Fuente "Nativa" (logo Ninjabot)
 *   - 'google'     → Fuente "Google" (icono oficial de Google)
 *   - 'web'        → Fuente "Web"
 *   - 'whatsapp'   → Fuente WhatsApp
 *   - 'messenger'  → Fuente Messenger
 *   - 'instagram'  → Fuente Instagram
 *
 * Variantes:
 *   - 'compact': solo icono (para espacios reducidos)
 *   - 'full': icono + etiqueta textual (para headers y fichas)
 *
 * Estética UX/UI Card: fondos translúcidos (bg-*-500/10), bordes invisibles
 * (border-black/5), jerarquía tipográfica clara con texto /90.
 */

import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiWhatsapp, SiMessenger, SiInstagram } from 'react-icons/si';
import type { AuthSource } from '../../types';

export type SourceBadgeVariant = 'compact' | 'full';

export interface SourceBadgeProps {
  /** Entidad de origen: 'ninjabot', 'google', 'web', 'whatsapp', 'messenger', 'instagram' */
  source?: AuthSource | 'web';
  /** Etiqueta personalizada (anula el label por defecto) */
  label?: string;
  /** 'compact' = solo icono, 'full' = icono + texto. Default: 'full' */
  variant?: SourceBadgeVariant;
  className?: string;
}

/** Icono/burbuja de Ninjabot (canal nativo) */
const NinjabotIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <span className={`${className} flex items-center justify-center text-[7px] font-bold text-white`}>
    N
  </span>
);

/** Icono de Web */
const WebIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/** Mapa de styling por fuente — fondos translúcidos y bordes invisibles */
const SOURCE_STYLES: Record<string, { bg: string; text: string; label?: string }> = {
  ninjabot:   { bg: 'bg-brand', text: 'text-white', label: 'Nativa' },
  google:     { bg: 'bg-white/80', text: 'text-gray-700/90', label: 'Google' },
  web:        { bg: 'bg-black/5', text: 'text-gray-900/90', label: 'Web' },
  whatsapp:   { bg: 'bg-emerald-500/10', text: 'text-emerald-700/90', label: 'WhatsApp' },
  messenger:  { bg: 'bg-blue-500/10', text: 'text-blue-700/90', label: 'Messenger' },
  instagram:  { bg: 'bg-rose-500/10', text: 'text-rose-700/90', label: 'Instagram' },
  facebook:   { bg: 'bg-blue-500/10', text: 'text-blue-700/90', label: 'Facebook' },
};

/** Renderiza el icono correspondiente a la fuente */
const SourceIcon: React.FC<{ source: string; compact?: boolean }> = ({ source, compact }) => {
  const iconClass = compact ? 'w-3 h-3' : 'w-3 h-3';
  switch (source) {
    case 'google':
      return <FcGoogle className={iconClass} />;
    case 'whatsapp':
      return <SiWhatsapp className={`${iconClass} text-[#25D366]`} />;
    case 'messenger':
      return <SiMessenger className={`${iconClass} text-[#006AFF]`} />;
    case 'instagram':
      return <SiInstagram className={`${iconClass} text-[#DD2A7B]`} />;
    case 'ninjabot':
      return <NinjabotIcon className={iconClass} />;
    case 'web':
      return <WebIcon className={iconClass} />;
    default:
      // Fallback neutral: círculo pequeño translúcido
      return <span className={`${iconClass} rounded-full bg-black/10`} />;
  }
};

/**
 * Resuelve la fuente de origen con fallback:
 * - undefined/vacío → 'ninjabot' (nativo por defecto para registros web)
 */
const resolveSource = (source?: string): string => {
  const s = (source || '').toLowerCase();
  if (!s) return 'ninjabot';
  if (s === 'web' || s === 'nativo' || s === 'nativa' || s === 'ninjabot') return 'ninjabot';
  return s;
};

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source = 'ninjabot',
  label,
  variant = 'full',
  className = '',
}) => {
  const resolved = resolveSource(source);
  const styles = SOURCE_STYLES[resolved] || SOURCE_STYLES.ninjabot;
  const displayLabel = label || styles.label || resolved.charAt(0).toUpperCase() + resolved.slice(1);

  return (
    <span
      title={`Fuente de registro: ${displayLabel}`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none select-none border border-black/5 ${
        variant === 'compact' ? 'px-1' : ''
      } ${styles.bg} ${styles.text} ${className}`}
    >
      <SourceIcon source={resolved} compact={variant === 'compact'} />
      {variant === 'full' && <span>{displayLabel}</span>}
    </span>
  );
};

export default SourceBadge;