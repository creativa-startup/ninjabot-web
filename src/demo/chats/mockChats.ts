/**
 * @module mockChats
 * @description Datos estáticos de demostración para los paneles N2/N3 del módulo Chats.
 * Extraídos de LayoutDemo.tsx para mantener el Layout Decoupling.
 *
 * Nota: este archivo es `.ts` (sin JSX). Los iconos se exportan como referencias
 * a componentes (`ComponentType`) y se renderizan en los paneles `.tsx` consumidores.
 */

import type { ComponentType } from 'react';
import { FaWhatsapp, FaInstagram, FaFacebookMessenger } from 'react-icons/fa';

/* ─── Tipos de datos demo ─── */

export type DemoChannel = 'whatsapp' | 'instagram' | 'messenger';

export interface DemoChat {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  channel: DemoChannel;
}

export interface DemoStatusItem {
  id: string;
  name: string;
}

export interface DemoFilterItem {
  id: string;
  label: string;
  active: boolean;
}

export interface DemoMessage {
  id: string;
  text: string;
  mine: boolean;
}

export interface DemoNote {
  id: string;
  date: string;
  text: string;
}

export interface JazsPost {
  id: string;
  name: string;
  handle: string;
  time: string;
  content: string;
}

export type Trend = string;

/** Creador destacado para la sección "Creadores" del modo Ninja (N2) */
export interface DemoCreator {
  id: string;
  name: string;
  handle: string;
  followers: string;
  category: string;
}

/** Metadatos de canal: componente de icono (no JSX) + color de marca */
export interface ChannelMeta {
  Icon: ComponentType<{ size?: number; className?: string; color?: string }>;
  color: string;
}

/* ─── Constantes demo ─── */

export const STATUS_ITEMS: DemoStatusItem[] = [
  { id: 's1', name: 'Tu estado' },
  { id: 's2', name: 'Ana' },
  { id: 's3', name: 'Luis' },
  { id: 's4', name: 'María' },
  { id: 's5', name: 'Carlos' },
];

export const FILTER_ITEMS: DemoFilterItem[] = [
  { id: 'all', label: 'Todos', active: true },
  { id: 'whatsapp', label: 'WhatsApp', active: false },
  { id: 'instagram', label: 'Instagram', active: false },
  { id: 'messenger', label: 'Messenger', active: false },
];

export const CHAT_CARDS: DemoChat[] = [
  { id: '1', name: 'María Fernanda', preview: 'Hola, ¿me puedes ayudar con mi pedido?', time: '10:42 AM', unread: 3, channel: 'whatsapp' },
  { id: '2', name: 'Carlos Andrade', preview: 'Gracias por la información 👍', time: '10:15 AM', unread: 1, channel: 'instagram' },
  { id: '3', name: 'Lucía Pérez', preview: '¿Cuándo hay disponibilidad?', time: '9:58 AM', unread: 0, channel: 'messenger' },
  { id: '4', name: 'Jorge Luis', preview: 'Perfecto, lo reviso y te confirmo.', time: '9:30 AM', unread: 5, channel: 'whatsapp' },
  { id: '5', name: 'Valentina Rizzo', preview: 'Me interesa el plan premium', time: '8:45 AM', unread: 0, channel: 'instagram' },
];

export const CHANNEL_ICONS: Record<DemoChannel, ChannelMeta> = {
  whatsapp: { Icon: FaWhatsapp, color: '#25D366' },
  instagram: { Icon: FaInstagram, color: '#DD2A7B' },
  messenger: { Icon: FaFacebookMessenger, color: '#1877F2' },
};

export const DEMO_MESSAGES: DemoMessage[] = [
  { id: 'm1', text: '¡Hola! Gracias por contactarnos 🙌', mine: true },
  { id: 'm2', text: 'Hola, ¿me pueden dar más información del plan premium?', mine: false },
  { id: 'm3', text: 'Claro, te comparto los detalles en un momento.', mine: true },
];

export const DEMO_NOTES: DemoNote[] = [
  { id: 'n1', date: '8 Ene 2026 · 4:20 PM', text: 'Recordar hacer seguimiento del pedido #1024 con María Fernanda.' },
  { id: 'n2', date: '7 Ene 2026 · 10:05 AM', text: 'Cliente interesado en el plan premium, agendar demo el viernes.' },
  { id: 'n3', date: '6 Ene 2026 · 3:47 PM', text: 'Enviar catálogo actualizado con precios de Meta Ads Esencial.' },
];

export const TRENDS: Trend[] = ['#SocialCommerce', '#Ventas', '#NinjaTips'];

/** Creadores destacados — sección premium del modo Ninja (N2) */
export const CREATORS: DemoCreator[] = [
  { id: 'c1', name: 'Ninja Master', handle: '@ninja_master', followers: '12.4k', category: 'Social Commerce' },
  { id: 'c2', name: 'Creativa Studio', handle: '@creativa_studio', followers: '8.1k', category: 'Automatización' },
  { id: 'c3', name: 'Jazs Insider', handle: '@jazs_insider', followers: '15.7k', category: 'Ventas IA' },
];

export const JAZS_POSTS: JazsPost[] = [
  {
    id: 'j1',
    name: 'Ninja Master',
    handle: '@ninja_master',
    time: 'hace 2 horas',
    content: 'El Social Commerce está transformando cómo las marcas venden: ¡el futuro es conversacional! 🚀',
  },
  {
    id: 'j2',
    name: 'Creativa Studio',
    handle: '@creativa_studio',
    time: 'hace 5 horas',
    content: 'Lanzamos nuevo flujo de automatización para recuperar carritos abandonados. +23% de conversión 📈',
  },
  {
    id: 'j3',
    name: 'Jazs Insider',
    handle: '@jazs_insider',
    time: 'hace 1 día',
    content: 'Consejo Ninja: personaliza tus respuestas con el contexto del cliente para cerrar más ventas. 💡',
  },
];