/**
 * @module ProductCard
 * @description Componente atómico de tarjeta de producto (Social Commerce).
 * Pieza de la nueva vista "Tienda Nativa" — optimizada para conversión.
 *
 * Sistema de Diseño — UX UI CARD:
 * - Superficie: materialidad flotante glass (glass-card-light / glass-card-dark
 *   + backdrop-blur vía Capa 1 en src/index.css).
 * - Bordes redondeados: la tarjeta raíz usa rounded-none (token global),
 *   la imagen usa card-media-inset-bordered (Capa 1: rounded-xl + ring de luz).
 * - Elevación: hover-lift (microinteracción tokenizada, sin sombras manuales).
 * - Jerarquía tipográfica: text-secondary (categoría), text-title (título),
 *   precio con --accent-color (token dinámico inyectado por el Sandbox UI/UX).
 *
 * Componente puro [Atom]: solo recibe props y renderiza. No conoce BD ni estado global.
 * El click del botón CTA (Plus) dispara onAddToCart(id).
 */

import React from 'react';
import { Plus } from 'lucide-react';

/** Producto del catálogo — contrato mínimo de la tarjeta */
export interface ProductCardProduct {
  id: string;
  title: string;
  /** Precio como string literal, ej. "29.99 USD" */
  price: string;
  /** URL de la imagen principal del producto */
  imageUrl?: string | null;
  /** Categoría del producto, ej. "Plantillas" */
  category?: string;
}

export interface ProductCardProps {
  /** Datos del producto a renderizar */
  product: ProductCardProduct;
  /** Callback al hacer clic en el botón de agregar al carrito */
  onAddToCart: (id: string) => void;
  /** Tema del shell padre (dark/light) para ajustar el placeholder de imagen */
  isDark?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  isDark = false,
}) => {
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart(product.id);
  };

  return (
    <article
      className={`group hover-lift flex flex-col gap-3 cursor-pointer ${
        isDark ? 'glass-card-dark' : 'glass-card-light'
      }`}
    >
      {/* ═══ Imagen (h-44 áurea + Capa 1: card-media-inset-bordered) ═══ */}
      <div className="card-media-inset-bordered h-44">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.03] select-none pointer-events-none"
          />
        ) : (
          /* Placeholder transparente cuando no hay URL de imagen */
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-secondary uppercase tracking-wider select-none">
              {product.category || 'Producto'}
            </span>
          </div>
        )}
      </div>

      {/* ═══ Info: categoría + título + precio/CTA ═══ */}
      <div className="flex flex-col min-w-0">
        {product.category && (
          <span className="text-secondary uppercase tracking-wider truncate">
            {product.category}
          </span>
        )}

        <h3 className="text-title truncate mt-0.5">{product.title}</h3>

        {/* Fila: precio destacado + botón agregar al carrito */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-base font-semibold text-[color:var(--accent-color)] truncate">
            {product.price}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            title={`Agregar ${product.title} al carrito`}
            aria-label={`Agregar ${product.title} al carrito`}
            className="p-1.5 bg-black/5 dark:bg-white/10 rounded-lg active:scale-95 transition-transform hover:bg-black/10 dark:hover:bg-white/15 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;