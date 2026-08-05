/**
 * @module ShoppingBagIcon
 * @description Icono SVG puro reutilizable — bolsa/funda de compras.
 * [Icon] puro: recibe size y className por props.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const ShoppingBagIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
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
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);