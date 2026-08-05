/**
 * @module ProfileStoreGrid
 * @description Cuadrícula de productos del perfil del creador (Social Commerce, Etapa 3).
 * Mapea el catálogo de la Meta Commerce API (id, title, price, availability, image_url)
 * a una rejilla visual 2 → 3 columnas con separadores finos de 1px.
 *
 * El click en una tarjeta dispara onProductClick, preparado para abrir el detalle
 * de producto N4 en el futuro.
 *
 * Sistema de Diseño — Capa 1 (Tokens y Superficies):
 * - Grid: gap-[1px] sobre fondo translúcido (líneas divisorias finas tipo masonería).
 * - Tarjeta: glass-subtle-light/dark + hover-lift + rounded-none + overflow-hidden.
 * - Imagen a sangre (edge-to-edge): aspect-square + object-cover, sin padding interno.
 * - Jerarquía tipográfica: text-title (título), text-body (precio), text-meta (disponibilidad).
 *
 * Componente puro [Grid]: solo recibe props (products + onProductClick) y renderiza.
 */

import React from 'react';

/** Producto del catálogo — contrato alineado al shape de la Meta Commerce API */
export interface ProfileStoreProduct {
  id: string;
  title: string;
  /** Precio como string literal, ej. "29.99 USD" */
  price: string;
  /** Disponibilidad, ej. "in stock", "out of stock" */
  availability: string;
  /** URL de la imagen principal del producto */
  image_url?: string | null;
}

export interface ProfileStoreGridProps {
  /** Lista de productos del catálogo del creador */
  products: ProfileStoreProduct[];
  /** Callback al hacer clic en una tarjeta — preparado para abrir el detalle N4 */
  onProductClick?: (product: ProfileStoreProduct) => void;
  /** Tema del shell padre (dark/light) para seleccionar la superficie glass-subtle */
  isDark?: boolean;
}

/* Variante wireframe cuando no hay image_url (patrón del Sandbox) */
const FALLBACK_GRADIENTS = [
  'from-fuchsia-500 via-purple-500 to-indigo-600',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-blue-500 via-indigo-500 to-violet-600',
];

export const ProfileStoreGrid: React.FC<ProfileStoreGridProps> = ({
  products,
  onProductClick,
  isDark = false,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-black/10 dark:bg-white/5 p-4">
      {products.map((product, index) => (
        <button
          key={product.id}
          type="button"
          onClick={() => onProductClick?.(product)}
          className={`flex flex-col relative cursor-pointer ${
            isDark ? 'glass-subtle-dark' : 'glass-subtle-light'
          } hover-lift rounded-none overflow-hidden text-left`}
        >
          {/* ─── Imagen superior "a sangre" (edge-to-edge) ─── */}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              className="w-full aspect-square object-cover select-none pointer-events-none"
            />
          ) : (
            /* Fallback wireframe: gradiente + orbes decorativos locales */
            <div
              className={`w-full aspect-square bg-gradient-to-br ${
                FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]
              }`}
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/25 blur-2xl" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-black/25 blur-3xl" />
            </div>
          )}

          {/* ─── Info inferior (padding interno) ─── */}
          <div className="flex flex-col gap-1 p-3 min-w-0">
            <h4 className="text-title text-sm truncate">{product.title}</h4>
            <p className="text-body text-[13px] font-medium truncate">
              {product.price}
            </p>
            <p className="text-meta truncate">{product.availability}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProfileStoreGrid;