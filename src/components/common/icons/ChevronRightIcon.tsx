/**
 * @module ChevronRightIcon
 * @description Icono SVG puro reutilizable — flecha derecha.
 * [Icon] puro: recibe size y className por props.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
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
    <polyline points="9 18 15 12 9 6" />
  </svg>
);