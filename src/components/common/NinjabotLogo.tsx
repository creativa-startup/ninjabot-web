/**
 * @module NinjabotLogo
 * @description Logo oficial de la entidad Ninjabot.
 * Componente [Brand] reutilizable que centraliza el uso del logotipo
 * en toda la aplicación. Usa el barril src/assets/ninjabot como único
 * origen de verdad para las variantes del logo.
 *
 * Uso:
 *   <NinjabotLogo variant="color" size="md" />
 *   <NinjabotLogo variant="blanco" size="lg" className="rounded-full" />
 *
 * Variantes:
 *   - color:  Logo principal a color (default)
 *   - blanco: Logo blanco para fondos oscuros/negros
 *   - negro:  Logo negro para fondos claros
 */

import React from 'react';
import { NINJABOT_LOGO, type NinjabotLogoVariant } from '../../assets/ninjabot';

export type NinjabotLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface NinjabotLogoProps {
  /** Variante del logotipo según el fondo donde se renderiza */
  variant?: NinjabotLogoVariant;
  /** Tamaño estándar del logo */
  size?: NinjabotLogoSize;
  /** Clases Tailwind adicionales */
  className?: string;
  /** Texto alternativo accesible */
  alt?: string;
}

const SIZE_CLASSES: Record<NinjabotLogoSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
  xl: 'w-14 h-14',
  '2xl': 'w-20 h-20',
};

export const NinjabotLogo: React.FC<NinjabotLogoProps> = ({
  variant = 'color',
  size = 'md',
  className = '',
  alt = 'Ninjabot',
}) => (
  <img
    src={NINJABOT_LOGO[variant]}
    alt={alt}
    className={`${SIZE_CLASSES[size]} object-contain ${className}`.trim()}
  />
);