/**
 * @module FilterIcon
 * @description Icono SVG puro reutilizable — filtro.
 * [Icon] puro: recibe size y className por props.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const FilterIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);