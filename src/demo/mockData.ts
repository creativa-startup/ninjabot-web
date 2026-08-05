// src/demo/mockData.ts - Datos de ejemplo para el entorno Sandbox.
import type { Contact, Note, PlatformConnection } from '../types';
import type { SocialPost } from '../features/chats/types';

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'mock-1',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '+593 99 123 4567',
    city: 'Quito',
    leadType: 'Servicio',
    interest: 'Meta Ads',
    source: 'WhatsApp',
    leadStage: 'Contacted',
    purchases: '0',
    unreadCount: 3,
    lastMessage: 'Hola, me interesa la automatizacion.',
    lastTime: '10:32',
    aiAgentEnabled: true,
    originPlatform: 'whatsapp',
    platform: 'whatsapp',
    linkedPlatforms: ['whatsapp'],
    leadLevel: 3,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hola, me interesa la automatizacion.', timestamp: '10:30', channel: 'whatsapp', status: 'read' },
      { id: 'm2', sender: 'agent', text: '¡Hola Maria! Te cuento como funciona Ninjabot.', timestamp: '10:32', channel: 'whatsapp', status: 'read' },
    ],
  },
  {
    id: 'mock-2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@example.com',
    phone: '+593 98 765 4321',
    city: 'Guayaquil',
    leadType: 'Producto',
    interest: 'Catalogo',
    source: 'Instagram',
    leadStage: 'Lead',
    purchases: 0,
    unreadCount: 1,
    lastMessage: 'El plan Pro incluye Instagram?',
    lastTime: 'Ayer',
    originPlatform: 'instagram',
    platform: 'instagram',
    linkedPlatforms: ['instagram', 'whatsapp'],
    leadLevel: 2,
  },
];

export const MOCK_NOTES: Note[] = [
  { id: 'n1', contactId: 'mock-1', text: 'Interesado en plan Pro.', createdAt: '2026-07-30T10:00:00Z' },
];

export const MOCK_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorName: 'Maria Garcia',
    authorHandle: '@mariagarcia',
    authorAvatar: 'MG',
    content: 'Gran experiencia con Ninjabot.',
    timestamp: '2026-07-29T14:30:00Z',
    channel: 'instagram',
    metrics: { comments: 12, likes: 89, shares: 5 },
    isOnline: true,
    handle: 'mariagarcia',
    userId: 'mock-user-1',
  },
];

export const MOCK_PLATFORM_STATUS: Record<string, PlatformConnection> = {
  whatsapp: 'connected',
  messenger: 'disconnected',
  instagram: 'connected',
};