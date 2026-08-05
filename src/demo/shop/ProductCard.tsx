/**
 * @module ProductCard
 * @description SHIM DE RETROCOMPATIBILIDAD — re-exporta el átomo de producción.
 *
 * Las piezas del Sandbox que importaban `ProductCard` desde `src/demo/shop/`
 * ahora re-dirigen al componente REAL de producción
 * (`src/components/ui/ProductCard.tsx`), que está 100% alineado al esquema de
 * la tabla `products` de Supabase:
 *   - id, name, price (numeric), currency, image_url, sku.
 *   - SIN `category` (columna inexistente → error PostgREST 400).
 *
 * El consumo nuevo DEBE importar directamente de `src/components/ui/ProductCard`.
 */

import { ProductCard, type ProductCardProduct, type ProductCardProps } from '../../components/ui/ProductCard';

export { ProductCard, type ProductCardProduct, type ProductCardProps };
export default ProductCard;
