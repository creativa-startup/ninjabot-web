/**
 * @module mockPlaygroundData
 * @description Datos simulados de alta fidelidad y contratos de tipado para el
 * Taller de Componentes (Component Playground) del Estudio del Sistema de Diseño.
 *
 * Responsabilidad Única: encapsular todos los mocks y tipos del módulo uiux
 * para evitar el "Spaghetti de Importaciones" en los componentes de UI.
 *
 * Alineación con componentes reales del Sandbox:
 *   - PlayPost   → contrato SocialPost (src/features/chats/types.ts)
 *   - PlayProduct → contrato ProductCardProduct (src/demo/shop/ProductCard.tsx)
 */

import type { SocialPost } from '../../features/chats/types';
import type { ProductCardProduct } from '../shop/ProductCard';

/** Componentes auditables en el taller (selector del Playground) */
export type TargetComponent = 'post' | 'product' | 'create-post' | 'video';

/** Alias del contrato real SocialPost del feed social */
export type PlayPost = SocialPost;

/** Alias del contrato real ProductCardProduct del catálogo */
export type PlayProduct = ProductCardProduct;

/** Post demo estándar — contrato SocialPost real (channel: 'instagram') */
export const PLAYGROUND_MOCK_POST: PlayPost = {
  id: 'play-post-1',
  authorName: 'Muro Ninja',
  authorHandle: '@muroninja',
  authorAvatar: 'MN',
  content:
    'Escribiendo el primer Jazs desde el Taller de Componentes. Validando la legibilidad del texto secundario y el contraste por color de las micro-interacciones. #designsystem #nextgen',
  timestamp: 'Hace 2 minutos',
  channel: 'instagram',
  metrics: { likes: 142, comments: 24, shares: 8 },
  isOnline: true,
};

/** Producto demo estándar — contrato ProductCardProduct real */
export const PLAYGROUND_MOCK_PRODUCT: PlayProduct = {
  id: 'play-prod-1',
  title: 'Taza Cerámica Ópalo',
  price: '24.99 USD',
  imageUrl:
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
  category: 'Disponible',
};

/** Video demo estándar — props reales de VideoCard (src/components/ui/VideoCard.tsx) */
export const PLAYGROUND_VIDEO = {
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  posterUrl: 'https://picsum.photos/seed/ninja-playground/400/720',
  views: '12.4K',
  authorName: 'Muro Ninja',
  authorHandle: 'muro_ninja',
  authorAvatar: undefined,
  description: 'Taller de Componentes: reproducción en hover y expansión adaptativa del reproductor.',
};