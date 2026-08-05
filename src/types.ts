// --- ARCHIVO COMPLETO: src/types.ts ---

// Etapas del lead estandarizadas (6 valores oficiales)
export type LeadStage = 
  | 'Lead' 
  | 'Contacted' 
  | 'Scheduled'
  | 'Checkout'
  | 'Purchased' 
  | 'Lost';

// Remitentes normalizados (3 valores: user, agent, system)
export type SenderType = 'user' | 'agent' | 'system';

// Plataformas de mensajería externa (canales entrantes tradicionales)
export type MessagingPlatform = 'whatsapp' | 'messenger' | 'instagram';

// --- NUEVOS TIPOS OMNICANAL (Identidad Única) ---

/**
 * Plataforma de origen: donde nació el contacto.
 * Incluye 'google' y 'facebook' como entidades de origen OAuth (auth_source),
 * utilizadas por el grupo de filtro 'ninjabot' (nativos + Google + Facebook).
 */
export type OriginPlatform = 'ninjabot' | 'whatsapp' | 'instagram' | 'messenger' | 'x' | 'google' | 'facebook';

/** Canal activo de la última interacción (incluye ninjabot como nativo) */
export type ActivePlatform = 'ninjabot' | 'whatsapp' | 'instagram' | 'messenger';

/** Conjunto completo de plataformas soportadas para filtros */
export type AllPlatforms = 'all' | 'ninjabot' | 'whatsapp' | 'instagram' | 'messenger';

/** Mapa de metadatos para cada plataforma (color, icono, label) */
export const PLATFORM_META: Record<string, { label: string; color: string; icon: string }> = {
  ninjabot:   { label: 'Ninjabot',   color: '#1a1a2e', icon: 'N' },
  whatsapp:   { label: 'WhatsApp',   color: '#25D366', icon: 'W' },
  instagram:  { label: 'Instagram',  color: '#DD2A7B', icon: 'I' },
  messenger:  { label: 'Messenger',  color: '#006AFF', icon: 'M' },
};

export interface Message {
  id: string;
  sender: SenderType;
  text: string;
  timestamp: string;
  channel?: MessagingPlatform | 'ia';
  status?: 'read' | 'delivered' | 'sent';
  external_id?: string;
  platform?: MessagingPlatform;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  leadType: string;
  interest: string;
  source: string;
  leadStage: LeadStage;
  purchases: string | number;
  unreadCount?: number;
  lastMessage?: string;
  lastTime?: string;
  aiAgentEnabled?: boolean;
  notes?: string;
  avatar?: string;
  messages?: Message[];
  isWhatsAppActive?: boolean;
  external_id?: string;
  // --- CAMPOS OMNICANAL (Identidad Única) ---
  /** Plataforma de origen: donde nació el contacto ('ninjabot' por defecto para registros web) */
  originPlatform?: OriginPlatform;
  /** Canal activo de la última interacción (incluye 'ninjabot' para nativos) */
  platform?: ActivePlatform;
  /** Canales adicionales vinculados a esta identidad única */
  linkedPlatforms?: ActivePlatform[];
  // ---
  leadLevel?: LeadTemperatureLevel;
}

export interface Note {
  id: string;
  contactId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Funnel {
  id: string;
  nombre?: string;
  tipo: string;
  presupuesto: string;
  descripcion: string;
  interes: string;
  etapas?: string[];
}

// Tipos de notificaciones del asistente Ninjabot
export type NotificationType = 'sales_summary' | 'integration_recommendation' | 'ai_suggestion' | 'system_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  preview: string;
  content: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string; // identifier for the action type
  platform?: MessagingPlatform;
}

// Requeridos por App.tsx y componentes de navegación
export type NavigationTab = 'chats' | 'contacts' | 'funnel' | 'notifications' | 'settings';

// Tipos de filtro de plataforma omnicanal
export type PlatformFilter = 'all' | MessagingPlatform | 'ninjabot';

// Modo de visualización del panel de filtros N2
export type FilterMode = 'conversaciones' | 'social_feed';

// --- TIPOS N2: FeedViewMode ---

/** Modo de visualización del feed N2 (alias semántico en inglés) */
export type FeedViewMode = 'chats' | 'posts';

/** Mapper FeedViewMode → FilterMode para compatibilidad */
export const FEED_VIEW_MODE_MAP: Record<FeedViewMode, FilterMode> = {
  chats: 'conversaciones',
  posts: 'social_feed',
};

/** Mapper inverso FilterMode → FeedViewMode */
export const FILTER_MODE_MAP: Record<FilterMode, FeedViewMode> = {
  conversaciones: 'chats',
  social_feed: 'posts',
};

// Nivel de temperatura del lead (LeadTemperatureMeter)
export type LeadTemperatureLevel = 0 | 1 | 2 | 3 | 4 | 5;

// --- TRAZABILIDAD DE FUENTE DE REGISTRO (profiles.auth_source) ---

/** Entidad de origen del registro del usuario: 'ninjabot' (nativo) o 'google' (OAuth) */
export type AuthSource = 'ninjabot' | 'google' | 'facebook' | string;

// Estado de conexión de plataformas omnicanal
export type PlatformConnection = 'connected' | 'disconnected' | 'connecting';

export type PlatformId = 'all' | 'ninjabot' | 'whatsapp' | 'messenger' | 'instagram';

export interface PlatformStatus {
  id: PlatformId;
  label: string;
  status: PlatformConnection;
  icon: string;
}

// --- FILTRO INTELIGENTE DE ENTIDADES DE ORIGEN (ControlFilterRrss) ---

/**
 * Entidad de origen para el filtro inteligente N2.
 * - 'all'         → Todos (sin filtrar)
 * - 'ninjabot'    → Grupo fuente nativa (incluye registros nativos + Google + Facebook)
 * - 'facebook'    → Entidad de origen OAuth Facebook (auth_source)
 * - 'whatsapp'    → Canal externo integrateable/filtrable
 * - 'instagram'   → Canal externo integrateable/filtrable
 * - 'messenger'   → Canal externo integrateable/filtrable
 *
 * NOTA: 'google' NO es botón del filtro — se muestra como entidad origen en la
 * tarjeta (SourceBadge). 'feed' quedó deshabilitado del filtro por decisión de producto.
 */
export type EntityFilter = 'all' | 'ninjabot' | 'facebook' | 'whatsapp' | 'instagram' | 'messenger';

/** Orden canónico de despliegue de canales externos en el filtro expansible */
export const ENTITY_ORDER: EntityFilter[] = ['whatsapp', 'instagram', 'messenger'];

// Tipado de Densidad Contenedora Global
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

// Mapa de Padding del Contenedor Principal del Panel (N2, N3, N4)
// Se incluye el reseteo explícito de box-sizing para evitar colapsos de margen
export const DENSITY_PANEL_MAP: Record<LayoutDensity, string> = {
  compact: 'm-0 p-2 gap-2 box-border',        // 8px padding
  comfortable: 'm-0 p-4 gap-4 box-border',    // 16px padding (Default)
  spacious: 'm-0 p-6 gap-6 box-border',       // 24px padding
};

// Mapa de Espaciado Vertical/Horizontal entre Elementos Internos
export const DENSITY_GAP_MAP: Record<LayoutDensity, string> = {
  compact: 'm-0 p-0 space-y-2',
  comfortable: 'm-0 p-0 space-y-4',
  spacious: 'm-0 p-0 space-y-6',
};

// Clase utilitaria opcional para forzar reseteo en contenedores de tarjetas
export const DENSITY_CARD_BASE = 'm-0 box-border border-0 outline-none';