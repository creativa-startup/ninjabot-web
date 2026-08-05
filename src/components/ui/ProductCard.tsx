/**
 * @module ProductCard
 * @description Componente atómico de tarjeta de producto (Social Commerce).
 * Graduado desde el Sandbox (src/demo/shop/ProductCard.tsx) a producción.
 * Pieza de la nueva vista "Tienda Nativa" — optimizada para conversión.
 *
 * ALINEACIÓN CON EL ESQUEMA REAL DE LA BASE DE DATOS (Supabase):
 * La tabla `products` contiene: id, user_id, meta_product_id, sku, name,
 * price (numeric), currency, image_url y updated_at.
 *
 * CRÍTICO: NO existe ninguna columna llamada `category`. El contrato
 * `ProductCardProduct` NO usa ni consulta `category` para evitar un error
 * PostgREST de Supabase (columnas inexistentes → error 400).
 *
 * Sistema de Diseño — Capa 1 (Tokens y Superficies):
 * - Contenedor: glass-card-light / glass-card-dark + padding 16px (p-4).
 * - Imagen: card-media-inset-bordered (Capa 1: rounded-xl + ring de luz).
 * - Sombra del botón CTA: shadow-[0_8px_16px_rgba(0,0,0,0.08)] (prohibido
 *   shadow-md o sombras duras).
 * - Badge de SKU visible con tracking de mayúsculas (uppercase tracking-wider).
 * - Fallback estético minimalista B/N con icono de caja si no hay image_url.
 *
 * Componente puro [Atom]: solo recibe props y renderiza. No conoce BD ni estado global.
 * El click del botón CTA (Plus) dispara onAddToCart(productId).
 */

import React from 'react';
import { Plus, Package } from 'lucide-react';

/** Producto del catálogo — contrato mínimo alineado a la tabla `products` */
export interface ProductCardProduct {
  /** ID del producto en Supabase */
  id: string;
  /** Nombre del producto (columna `name` de la tabla products) */
  name: string;
  /** Precio numérico (columna `price` numeric de la tabla products) */
  price: number;
  /** Moneda del precio (columna `currency` — ej. 'USD') */
  currency?: string | null;
  /** URL de la imagen principal (columna `image_url` — opcional/nullable) */
  image_url?: string | null;
  /** SKU del producto (columna `sku` — opcional/nullable) */
  sku?: string | null;
}

export interface ProductCardProps {
  /** Datos del producto a renderizar */
  product: ProductCardProduct;
  /** Tema del shell padre (dark/light) para ajustar superficies */
  isDark?: boolean;
  /** Callback al hacer clic en el botón de agregar al carrito (recibe el ID) */
  onAddToCart?: (productId: string) => void;
}

/** Formatea el precio numérico con la moneda de la BD (ej. 29.99 → "$29.99 USD") */
const formatPrice = (price: number, currency?: string | null): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  switch ((currency || 'USD').toUpperCase()) {
    case 'USD':
      return `$${formatted} USD`;
    case 'EUR':
      return `€${formatted} EUR`;
    case 'MXN':
      return `$${formatted} MXN`;
    case 'COP':
      return `$${formatted} COP`;
    default:
      return `${formatted} ${currency || 'USD'}`;
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isDark = false,
  onAddToCart,
}) => {
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  return (
    <article
      className={`group hover-lift flex flex-col gap-3 cursor-pointer p-4 ${
        isDark ? 'glass-card-dark' : 'glass-card-light'
      }`}
    >
      {/* ═══ Imagen (h-44 áurea + Capa 1: card-media-inset-bordered) ═══ */}
      <div className="card-media-inset-bordered h-44 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.03] select-none pointer-events-none"
          />
        ) : (
          /* Fallback estético minimalista B/N — icono de caja (Package) */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] select-none">
            <Package
              size={28}
              strokeWidth={1}
              className={isDark ? 'text-white/20' : 'text-black/15'}
            />
            <span className="text-caption uppercase tracking-widest select-none">
              Sin imagen
            </span>
          </div>
        )}
      </div>

      {/* ═══ Info: nombre + SKU + precio/CTA ═══ */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Badge de SKU — tracking de mayúsculas elegante */}
        {product.sku && (
          <span className="inline-flex self-start px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-[0.14em] mb-1.5 bg-transparent border-black/10 dark:border-white/15 text-gray-500/80 dark:text-white/40 select-none">
            {product.sku}
          </span>
        )}

        <h3 className="text-title truncate leading-snug">{product.name}</h3>

        {/* Fila: precio destacado + botón agregar al carrito */}
        <div className="flex justify-between items-center mt-auto pt-2">
          <span className="text-sm font-semibold text-[color:var(--accent-color)] truncate">
            {formatPrice(product.price, product.currency)}
          </span>

          {onAddToCart && (
            <button
              type="button"
              onClick={handleAddToCart}
              title={`Agregar ${product.name} al carrito`}
              aria-label={`Agregar ${product.name} al carrito`}
              className="p-1.5 rounded-lg transition-all duration-200 active:scale-95 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white shadow-[0_8px_16px_rgba(0,0,0,0.08)] flex-shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;