/**
 * @module mockSettings
 * @description Datos wireframe (mock) del Módulo de Configuraciones del Perfil.
 * Centraliza los 7 módulos del creador (Cuenta, Integraciones, Tienda, Tickets,
 * Ninjabot, Dashboard, Apariencia/UI-UX) con datos demo autocontenidos para:
 *   - SettingsN2ListPanel (Panel N2 — Lista de Módulos con badges opcionales)
 *   - SettingsN3DetailPanel (Panel N3 — Detalle dinámico según activeView)
 *   - CatalogN4CreateProductForm (Panel N4 — Foco de creación de producto)
 */

import type { ProductCardProduct } from '../shop/ProductCard';

/* ─── Vistas de configuración (sub-módulos del Perfil) ─── */
export type SettingsView =
  | 'account'
  | 'integrations'
  | 'store'
  | 'tickets'
  | 'ninjabot'
  | 'dashboard'
  | 'ui_ux';

/* ─── Módulo de configuración (ítem del listado N2) ─── */
export interface SettingsModule {
  id: SettingsView;
  label: string;
  description: string;
  /** Clave del icono (Consumer decide el mapeo lucide) */
  icon: string;
  /** Badge opcional de notificaciones (ej. tickets pendientes) */
  badge?: number;
}

export const SETTINGS_MODULES: SettingsModule[] = [
  {
    id: 'account',
    label: 'Cuenta',
    description: 'Gestiona tu perfil de creador, datos personales y preferencias.',
    icon: 'user',
  },
  {
    id: 'integrations',
    label: 'Integraciones',
    description: 'Conecta y administra tus plataformas: Instagram, Facebook y más.',
    icon: 'plug',
  },
  {
    id: 'store',
    label: 'Tienda',
    description: 'Administra tu catálogo de productos y el historial de pedidos.',
    icon: 'shopping-bag',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    description: 'Compra, vende y transfiere boletos de tus eventos y experiencias.',
    icon: 'ticket',
    badge: 2,
  },
  {
    id: 'ninjabot',
    label: 'Ninjabot',
    description: 'Configura tu asistente IA: respuestas automáticas y agentes.',
    icon: 'zap',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Métricas clave de tu negocio: ventas, alcance y conversión.',
    icon: 'layout-dashboard',
  },
  {
    id: 'ui_ux',
    label: 'Apariencia',
    description: 'Estudio de control espacial: densidad, materialidad y contraste.',
    icon: 'palette',
  },
];

/* ─── Tienda: producto del catálogo (extiende ProductCardProduct con SKU) ─── */
export interface DemoProduct extends ProductCardProduct {
  sku: string;
}

export const DEMO_STORE_PRODUCTS: DemoProduct[] = [
  {
    id: 'prod-1',
    title: 'Plantilla de Reels',
    price: '29.99 USD',
    sku: 'TPL-REELS-001',
    imageUrl: null,
    category: 'Disponible',
  },
  {
    id: 'prod-2',
    title: 'Guía Growth Hacking',
    price: '19.99 USD',
    sku: 'GUI-GROW-002',
    imageUrl: null,
    category: 'Disponible',
  },
  {
    id: 'prod-3',
    title: 'Curso Embudos IA',
    price: '49.99 USD',
    sku: 'CRS-FUNNEL-003',
    imageUrl: null,
    category: 'Disponible',
  },
  {
    id: 'prod-4',
    title: 'Pack Mockups',
    price: '9.99 USD',
    sku: 'PKG-MOCK-004',
    imageUrl: null,
    category: 'Disponible',
  },
  {
    id: 'prod-5',
    title: 'Mentoría 1:1',
    price: '79.99 USD',
    sku: 'MNT-ONE-005',
    imageUrl: null,
    category: 'Stock limitado',
  },
  {
    id: 'prod-6',
    title: 'Kit Branding',
    price: '39.99 USD',
    sku: 'KIT-BRAND-006',
    imageUrl: null,
    category: 'Agotado',
  },
];

/* ─── Tienda: pedido (historial de compras) ─── */
export interface DemoOrder {
  id: string;
  customer: string;
  product: string;
  date: string;
  total: string;
  status: 'Completado' | 'En proceso' | 'Enviado' | 'Cancelado';
}

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'ORD-1024',
    customer: 'María Fernanda',
    product: 'Curso Embudos IA',
    date: '8 Ene · 4:20 PM',
    total: '49.99 USD',
    status: 'Completado',
  },
  {
    id: 'ORD-1023',
    customer: 'Carlos Mendoza',
    product: 'Plantilla de Reels',
    date: '7 Ene · 10:05 AM',
    total: '29.99 USD',
    status: 'Enviado',
  },
  {
    id: 'ORD-1022',
    customer: 'Jazmín Ortega',
    product: 'Guía Growth Hacking',
    date: '6 Ene · 3:47 PM',
    total: '19.99 USD',
    status: 'En proceso',
  },
  {
    id: 'ORD-1021',
    customer: 'Andrés Ruiz',
    product: 'Pack Mockups',
    date: '5 Ene · 11:30 AM',
    total: '9.99 USD',
    status: 'Completado',
  },
  {
    id: 'ORD-1020',
    customer: 'Valentina Paz',
    product: 'Kit Branding',
    date: '4 Ene · 2:15 PM',
    total: '39.99 USD',
    status: 'Cancelado',
  },
];

/* ─── Tickets: boleto comprado (QR simulado estéticamente) ─── */
export interface DemoTicket {
  id: string;
  event: string;
  date: string;
  location: string;
  code: string;
  holder: string;
}

export const DEMO_BOUGHT_TICKETS: DemoTicket[] = [
  {
    id: 'ticket-1',
    event: 'Festival Jazs Live 2026',
    date: '12 Mar 2026 · 8:00 PM',
    location: 'Centro de Convenciones, Quito',
    code: 'JZLS-26A-7F3K',
    holder: 'Mi Negocio',
  },
  {
    id: 'ticket-2',
    event: 'Conferencia Social Commerce',
    date: '20 Mar 2026 · 9:00 AM',
    location: 'Auditorio Principal, Guayaquil',
    code: 'SCMC-26B-9Q2T',
    holder: 'Mi Negocio',
  },
];

/* ─── Tickets: traspaso vendido (historial) ─── */
export interface DemoSoldTicket {
  id: string;
  event: string;
  date: string;
  transferredTo: string;
  code: string;
  price: string;
}

export const DEMO_SOLD_TICKETS: DemoSoldTicket[] = [
  {
    id: 'sold-1',
    event: 'Masterclass IA para Ventas',
    date: '5 Mar 2026',
    transferredTo: 'Lucía Torres',
    code: 'MLIA-26C-4H8P',
    price: '25.00 USD',
  },
  {
    id: 'sold-2',
    event: 'Workshop Reels que Venden',
    date: '28 Feb 2026',
    transferredTo: 'Pedro Salazar',
    code: 'WRQV-26D-2B5N',
    price: '15.00 USD',
  },
];

/* ─── Integraciones: conexiones Meta ─── */
export interface DemoMetaConnection {
  id: string;
  platform: string;
  label: string;
  connected: boolean;
  detail: string;
}

export const DEMO_META_CONNECTIONS: DemoMetaConnection[] = [
  {
    id: 'meta-instagram',
    platform: 'instagram',
    label: 'Instagram Direct',
    connected: true,
    detail: '@mi_negocio · Catálogo sincronizado',
  },
  {
    id: 'meta-facebook',
    platform: 'facebook',
    label: 'Facebook Messenger',
    connected: true,
    detail: 'Página: Mi Negocio · 12.4k seguidores',
  },
  {
    id: 'meta-commerce',
    platform: 'commerce',
    label: 'Meta Commerce',
    connected: true,
    detail: 'Catálogo activo · 6 productos',
  },
  {
    id: 'meta-whatsapp',
    platform: 'whatsapp',
    label: 'WhatsApp Business API',
    connected: false,
    detail: 'Conecta tu número para recibir chats de venta',
  },
];

/* ─── Compatibilidad legacy: grupos genéricos (Etapa 2) ─── */
export type SettingValueType = 'toggle' | 'select' | 'text' | 'button';

export interface DemoSettingOption {
  id: string;
  label: string;
  value: boolean | string | null;
  type: SettingValueType;
  disabled?: boolean;
}

export interface DemoSettingGroup {
  id: string;
  group: 'Conexiones' | 'Privacidad' | 'Notificaciones' | 'Apariencia' | 'Avanzado';
  label: string;
  description: string;
  icon: string;
  options: DemoSettingOption[];
}

export const DEMO_SETTING_GROUPS: DemoSettingGroup[] = [
  {
    id: 'settings-1',
    group: 'Conexiones',
    label: 'Canales de Venta',
    description: 'Conecta tus plataformas de mensajería y redes sociales.',
    icon: 'plug',
    options: [
      { id: 's1-opt1', label: 'WhatsApp Business API', value: true, type: 'toggle' },
      { id: 's1-opt2', label: 'Instagram Direct', value: true, type: 'toggle' },
    ],
  },
];

export default SETTINGS_MODULES;