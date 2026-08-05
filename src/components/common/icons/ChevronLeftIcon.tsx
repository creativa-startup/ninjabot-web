/**
 * @module ChevronLeftIcon
 * @description Icono SVG puro reutilizable — flecha izquierda.
 * [Icon] puro: recibe size y className por props.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);