/**
 * @module ChatN2Skeleton
 * @description Componente Skeleton para feedback de carga del panel N2.
 * Renderiza una serie de líneas animadas simulando las tarjetas de la lista.
 * Estética enterprise: placeholders neutros con fondo gris suave.
 */

import React from 'react';

interface ChatN2SkeletonProps {
  /** Número de líneas skeleton a renderizar (default: 6) */
  count?: number;
}

const SkeletonLine: React.FC = () => (
  <div className="flex gap-3 items-center px-3 py-3 animate-pulse">
    {/* Avatar circular */}
    <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
    {/* Líneas de texto */}
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-28" />
        <div className="h-2.5 bg-gray-100 rounded-full w-10" />
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full w-44" />
    </div>
  </div>
);

export const ChatN2Skeleton: React.FC<ChatN2SkeletonProps> = ({ count = 6 }) => (
  <div className="divide-y divide-gray-100">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonLine key={i} />
    ))}
  </div>
);

export default ChatN2Skeleton;