/**
 * @module ChatsFeatureTypes
 * @description Tipos específicos del módulo ChatsFeature.
 * SocialPost y tipos auxiliares para el feed polimórfico N2.
 */

/** Post social para el feed tipo RRSS */
export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  channel: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  metrics: {
    comments: number;
    likes: number;
    shares: number;
  };
  isOnline?: boolean;
  /** Handle único del autor (sin @) — Identidad Única para navegación /@handle */
  handle?: string;
  /** ID del usuario autor (profiles.id) */
  userId?: string;
  /** URL de la imagen adjunta al post (opcional) */
  media_url?: string;
  /** Indica si el post es un insert optimista pendiente de confirmación en BD */
  isPending?: boolean;
}

/** Mocks por defecto para el feed de posts (usados en ChatsFeature) */
export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorName: 'María García',
    authorHandle: '@mariagarcia',
    authorAvatar: 'MG',
    content: '¡Increíble experiencia con Ninjabot! 🤖 La automatización de respuestas nos ha ayudado a aumentar nuestras ventas en un 40% este mes. Totalmente recomendado para e-commerce.',
    timestamp: '2026-07-29T14:30:00Z',
    channel: 'instagram',
    metrics: { comments: 12, likes: 89, shares: 5 },
    isOnline: true,
  },
  {
    id: 'post-2',
    authorName: 'Carlos Mendoza',
    authorHandle: '@carlosmend',
    authorAvatar: 'CM',
    content: '¿Alguien ha probado la integración de WhatsApp Business con Ninjabot? Estamos considerando migrar nuestro servicio al cliente.',
    timestamp: '2026-07-29T10:15:00Z',
    channel: 'facebook',
    metrics: { comments: 24, likes: 45, shares: 8 },
    isOnline: true,
  },
  {
    id: 'post-3',
    authorName: 'TechStore EC',
    authorHandle: '@techstoreec',
    authorAvatar: 'TS',
    content: 'Hoy lanzamos nuestra nueva colección de laptops 🚀. Usen el código NINJA10 para 10% de descuento en su primera compra. #Tech #Ecuador',
    timestamp: '2026-07-28T09:00:00Z',
    channel: 'twitter',
    metrics: { comments: 8, likes: 156, shares: 34 },
  },
  {
    id: 'post-4',
    authorName: 'Ana Beltrán',
    authorHandle: '@anabeltran',
    authorAvatar: 'AB',
    content: 'Tip del día: segmenta tus leads por etapa de compra antes de enviar campañas masivas. El lead scoring automático de Ninjabot hace esto súper fácil. 📊',
    timestamp: '2026-07-27T16:45:00Z',
    channel: 'linkedin',
    metrics: { comments: 31, likes: 210, shares: 67 },
    isOnline: true,
  },
  {
    id: 'post-5',
    authorName: 'Laura Jiménez',
    authorHandle: '@laurajimenez',
    authorAvatar: 'LJ',
    content: '¡Primer pedido gestionado completamente desde el chat de Instagram! La conexión omnicanal de Ninjabot funciona de maravilla. 💪📱',
    timestamp: '2026-07-26T20:30:00Z',
    channel: 'instagram',
    metrics: { comments: 18, likes: 234, shares: 42 },
    isOnline: false,
  },
  {
    id: 'post-6',
    authorName: 'Distribuidora XYZ',
    authorHandle: '@distxyz',
    authorAvatar: 'DX',
    content: 'Buscando integración con catálogo de productos para responder automáticamente preguntas frecuentes sobre precios y disponibilidad. ¿Recomendaciones?',
    timestamp: '2026-07-25T11:20:00Z',
    channel: 'facebook',
    metrics: { comments: 15, likes: 32, shares: 3 },
  },
];