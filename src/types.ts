// --- ARCHIVO COMPLETO: src/types.ts ---

// Etapas del lead normalizadas
export type LeadStage = 
  | 'Lead Nuevo' 
  | 'Contactado' 
  | 'Interesado'
  | 'Cotización'
  | 'En negociación' 
  | 'Cerrado' 
  | 'Perdido';

// Remitentes normalizados
export type SenderType = 'user' | 'ia' | 'agent' | 'system';

export interface Message {
  id: string;
  sender: SenderType;
  text: string;
  timestamp: string;
  channel?: 'whatsapp' | 'instagram' | 'facebook' | 'ia';
  status?: 'read' | 'delivered' | 'sent';
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
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

// Requeridos por App.tsx y componentes de navegación
export type NavigationTab = 'chats' | 'contacts' | 'funnel' | 'settings';