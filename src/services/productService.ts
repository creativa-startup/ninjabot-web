/**
 * @module productService
 * @description Servicio de productos del catálogo con Supabase.
 * Módulo puro TypeScript en src/services/ — sin dependencias React.
 * Mapea la tabla: products (Fase 1 — Social Commerce / Tienda Nativa).
 *
 * ALINEACIÓN CON EL ESQUEMA REAL DE LA BASE DE DATOS (Supabase):
 * La tabla `products` contiene: id, user_id, meta_product_id, sku, name,
 * price (numeric), currency, image_url y updated_at.
 *
 * CRÍTICO: NO existe ninguna columna llamada `category`. El SELECT solo
 * consulta columnas reales — evita un error PostgREST de Supabase
 * (columnas inexistentes → error 400).
 *
 * Relaciones:
 *   profiles 1:N products (cada producto pertenece al user_id de un perfil)
 */

import { supabase } from './supabase';
import type { ProductCardProduct } from '../components/ui/ProductCard';

/**
 * Obtiene los productos del catálogo de un usuario específico.
 *
 * Consulta columnas REALES de la tabla `products` y mapea el `price`
 * numérico de la BD (numeric) al contrato de UI `ProductCardProduct`.
 * No consulta `category` (columna inexistente) → cero errores PostgREST.
 *
 * @param userId - ID del usuario (profiles.id) propietario del catálogo
 * @returns Promise<ProductCardProduct[]> — productos ordenados por nombre
 */
export const fetchProductsByUser = async (userId: string): Promise<ProductCardProduct[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, sku, image_url, currency')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products by user:', error);
    throw error;
  }

  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    currency: p.currency,
    image_url: p.image_url,
    sku: p.sku,
  }));
};