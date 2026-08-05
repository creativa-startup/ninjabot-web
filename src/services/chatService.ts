/**
 * @module chatService
 * @description Servicio de chat con Supabase (CRUD + Realtime).
 * Módulo puro TypeScript en src/services/ — sin dependencias React.
 * Mapea las tablas: contacts, conversations, messages, conversation_notes.
 *
 * Relaciones:
 *   contacts 1:N conversations (un contacto puede tener una conversación activa)
 *   conversations 1:N messages
 *   conversations 1:N conversation_notes (notas vinculadas a la conversación)
 */

import { supabase } from './supabase';
import type { Contact, Message, Note, SenderType, MessagingPlatform, LeadStage, ActivePlatform, OriginPlatform } from '../types';

// ──────────────────────────────────────────────
// Tipos internos de BD (mapeo columnas DB -> types.ts)
// ──────────────────────────────────────────────

interface DBContact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  lead_stage: string | null;
  /** Canal activo de la última interacción (incluye 'ninjabot' en el enum) */
  platform: ActivePlatform | null;
  /** Plataforma de origen: donde nació el contacto ('ninjabot' para registros web) */
  origin_platform: string | null;
  /** Canales adicionales vinculados a esta identidad única */
  linked_platforms: string[] | null;
  external_id: string | null;
  created_at: string;
}

interface DBConversation {
  id: string;
  user_id: string;
  contact_id: string;
  phone_number_id: string | null;
  status: string | null;
  last_message: string | null;
  platform: MessagingPlatform | null;
  created_at: string;
  updated_at: string;
}

interface DBMessage {
  id: string;
  conversation_id: string;
  type: string | null;
  content: string;
  sender: string;
  is_agent: boolean | null;
  timestamp: string;
  platform: MessagingPlatform | null;
  status: string | null;
}

interface DBNote {
  id: string;
  conversation_id: string;
  user_id: string | null;
  content: string;
  is_ai_generated: boolean | null;
  include_in_context: boolean | null;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────
// Mappers DB -> types.ts
// ──────────────────────────────────────────────

const LEAD_STAGE_MAP: Record<string, LeadStage> = {
  'Lead nuevo': 'Lead',
  'Lead': 'Lead',
  'Contactado': 'Contacted',
  'Interesado': 'Scheduled',
  'Cotización': 'Checkout',
  'En negociación': 'Checkout',
  'Cerrado': 'Purchased',
  'Cliente': 'Purchased',
  'Perdido': 'Lost',
  'Perdidos': 'Lost',
};

function mapLeadStage(dbStage: string | null): LeadStage {
  if (!dbStage) return 'Lead';
  return LEAD_STAGE_MAP[dbStage] || 'Lead';
}

function mapSenderType(sender: string, isAgent: boolean | null): SenderType {
  if (isAgent) return 'agent';
  if (sender === 'user' || sender === 'system') return sender as SenderType;
  return 'user';
}

function mapMessage(msg: DBMessage, platform?: MessagingPlatform): Message {
  return {
    id: msg.id,
    sender: mapSenderType(msg.sender, msg.is_agent),
    text: msg.content,
    timestamp: formatTimestamp(msg.timestamp),
    channel: msg.platform || platform || 'whatsapp',
    status: (msg.status as Message['status']) || 'delivered',
    platform: msg.platform || platform || undefined,
  };
}

function mapContact(db: DBContact, conversation?: DBConversation): Contact {
  return {
    id: db.id,
    name: db.name,
    email: db.email || '',
    phone: db.phone || '',
    city: db.city || '',
    leadType: '',
    interest: '',
    source: '',
    leadStage: mapLeadStage(db.lead_stage),
    purchases: 0,
    unreadCount: 0,
    lastMessage: conversation?.last_message || '',
    lastTime: conversation?.updated_at ? formatRelativeTime(conversation.updated_at) : '',
    platform: db.platform || 'ninjabot',
    originPlatform: (db.origin_platform as OriginPlatform) || 'ninjabot',
    linkedPlatforms: (db.linked_platforms as ActivePlatform[]) || [],
    leadLevel: 3,
    messages: [],
  };
}

function mapNote(note: DBNote): Note {
  return {
    id: note.id,
    contactId: note.conversation_id, // mapeamos conversation_id como contactId para compatibilidad
    text: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

// ──────────────────────────────────────────────
// Saneamiento del enum messaging_platform
// ──────────────────────────────────────────────

/** Valores válidos del enum PostgreSQL messaging_platform (incluye 'ninjabot' tras la migración) */
const DB_MESSAGING_PLATFORMS: ActivePlatform[] = ['whatsapp', 'messenger', 'instagram', 'ninjabot'];

/**
 * Convierte una plataforma de UI (ActivePlatform, incluye 'ninjabot')
 * a un valor válido del enum PostgreSQL messaging_platform.
 * 'ninjabot' es un valor nativo del enum desde la migración
 * add_ninjabot_to_messaging_platform_enum → se preserva tal cual.
 */
function toDbMessagingPlatform(platform: string | null | undefined): ActivePlatform {
  if (platform && DB_MESSAGING_PLATFORMS.includes(platform as ActivePlatform)) {
    return platform as ActivePlatform;
  }
  return 'ninjabot';
}

// ──────────────────────────────────────────────
// Utilerías de formato
// ──────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Ahora';
  if (diffHours < 24) return formatTimestamp(iso);
  if (diffDays === 1) return 'Ayer';
  return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

// ──────────────────────────────────────────────
// Servicios de consulta
// ──────────────────────────────────────────────

/**
 * Obtiene todos los contactos con su conversación activa (join).
 * Devuelve Contact[] listo para renderizar en N2.
 */
export async function fetchContactsWithConversations(): Promise<Contact[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  // 1. Obtener contactos del usuario
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (contactsError) throw contactsError;
  if (!contacts || contacts.length === 0) return [];

  // 2. Obtener conversaciones activas para estos contactos
  const contactIds = contacts.map((c: DBContact) => c.id);
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .in('contact_id', contactIds)
    .eq('status', 'active');

  if (convError) throw convError;

  // 3. Mapear contactos con su conversación
  const convByContactId: Record<string, DBConversation> = {};
  if (conversations) {
    conversations.forEach((conv: DBConversation) => {
      convByContactId[conv.contact_id] = conv;
    });
  }

  return contacts.map((db: DBContact) => {
    const conversation = convByContactId[db.id];
    return mapContact(db, conversation);
  });
}

/**
 * Obtiene los mensajes de una conversación dado un contactId.
 */
export async function fetchMessagesByContact(contactId: string): Promise<Message[]> {
  // Primero obtener la conversación activa del contacto
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, platform')
    .eq('contact_id', contactId)
    .eq('status', 'active')
    .maybeSingle();

  if (convError) throw convError;
  if (!conv) return [];

  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conv.id)
    .order('timestamp', { ascending: true });

  if (msgError) throw msgError;
  if (!messages) return [];

  return messages.map((msg: DBMessage) => mapMessage(msg, conv.platform || undefined));
}

/**
 * Obtiene las notas de una conversación dado un contactId.
 */
export async function fetchNotesByContact(contactId: string): Promise<Note[]> {
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('contact_id', contactId)
    .eq('status', 'active')
    .maybeSingle();

  if (convError) throw convError;
  if (!conv) return [];

  const { data: notes, error: noteError } = await supabase
    .from('conversation_notes')
    .select('*')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: false });

  if (noteError) throw noteError;
  return (notes || []).map(mapNote);
}

/**
 * Obtiene todas las notas de todos los contactos del usuario.
 */
export async function fetchAllNotes(): Promise<Note[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('status', 'active');

  if (convError || !conversations || conversations.length === 0) return [];

  const conversationIds = conversations.map((c: { id: string }) => c.id);
  const { data: notes, error: noteError } = await supabase
    .from('conversation_notes')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });

  if (noteError) throw noteError;
  return (notes || []).map(mapNote);
}

// ──────────────────────────────────────────────
// Operaciones de escritura (mutaciones)
// ──────────────────────────────────────────────

/**
 * Envía un mensaje en una conversación.
 * Si no existe conversación activa, la crea.
 */
export async function sendMessage(
  contactId: string,
  text: string,
  sender: 'user' | 'agent' = 'user',
): Promise<Message> {
  // 1. Obtener o crear conversación
  let conversationId: string;
  const { data: existingConv, error: findConvError } = await supabase
    .from('conversations')
    .select('id, platform')
    .eq('contact_id', contactId)
    .eq('status', 'active')
    .maybeSingle();

  if (findConvError) throw findConvError;

  if (existingConv) {
    conversationId = existingConv.id;
  } else {
    // Obtener el contacto para saber el platform
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('platform, user_id')
      .eq('id', contactId)
      .single();
    
    if (contactError || !contact) throw new Error('Contact not found');

    const { data: newConv, error: createConvError } = await supabase
      .from('conversations')
      .insert({
        contact_id: contactId,
        user_id: contact.user_id,
        platform: toDbMessagingPlatform(contact.platform),
        status: 'active',
      })
      .select()
      .single();

    if (createConvError) throw createConvError;
    conversationId = newConv.id;
  }

  // 2. Insertar el mensaje
  const isAgent = sender === 'agent';
  const { data: msg, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      content: text,
      sender: sender,
      is_agent: isAgent,
      type: 'text',
      status: 'sent',
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (msgError) throw msgError;

  // 3. last_message y updated_at se actualizan automáticamente
  //    vía trigger AFTER INSERT trigger_update_last_message en la BD.
  //    El frontend no debe calcular estados derivados (patrón Single Source of Truth).

  return mapMessage(msg);
}

/**
 * Agrega una nota a la conversación de un contacto.
 */
export async function addNote(contactId: string, text: string): Promise<Note> {
  // Obtener o crear conversación activa
  let conversationId: string;
  const { data: existingConv, error: findConvError } = await supabase
    .from('conversations')
    .select('id')
    .eq('contact_id', contactId)
    .eq('status', 'active')
    .maybeSingle();

  if (findConvError) throw findConvError;

  if (existingConv) {
    conversationId = existingConv.id;
  } else {
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('user_id, platform')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) throw new Error('Contact not found');

    const { data: newConv, error: createConvError } = await supabase
      .from('conversations')
      .insert({
        contact_id: contactId,
        user_id: contact.user_id,
        platform: toDbMessagingPlatform(contact.platform),
        status: 'active',
      })
      .select()
      .single();

    if (createConvError) throw createConvError;
    conversationId = newConv.id;
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data: note, error: noteError } = await supabase
    .from('conversation_notes')
    .insert({
      conversation_id: conversationId,
      user_id: user?.id || null,
      content: text,
      is_ai_generated: false,
      include_in_context: true,
    })
    .select()
    .single();

  if (noteError) throw noteError;
  return mapNote(note);
}

/**
 * Edita una nota existente.
 */
export async function editNote(noteId: string, newText: string): Promise<Note> {
  const { data: note, error } = await supabase
    .from('conversation_notes')
    .update({ content: newText, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return mapNote(note);
}

/**
 * Elimina una nota.
 */
export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('conversation_notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
}

// ──────────────────────────────────────────────
// Tipos para callbacks de Realtime
// ──────────────────────────────────────────────

export interface RealtimeEvent<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}

export type MessageCallback = (message: Message, conversationId: string) => void;
export type NoteCallback = (note: Note) => void;

// ──────────────────────────────────────────────
// Suscripciones Realtime
// ──────────────────────────────────────────────

/**
 * Se suscribe a cambios en la tabla messages para una conversación específica.
 * Retorna la función unsubscribe.
 *
 * @param conversationId - ID de la conversación a observar
 * @param onMessage - callback cuando se inserta un mensaje
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: MessageCallback,
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const msg = payload.new as DBMessage;
        onMessage(mapMessage(msg), conversationId);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Se suscribe a cambios en la tabla conversation_notes para una conversación.
 * Maneja INSERT, UPDATE, DELETE.
 *
 * @param conversationId - ID de la conversación
 * @param onNoteChange - callback con la nota afectada y tipo de evento
 */
export function subscribeToNotes(
  conversationId: string,
  onInsert: (note: Note) => void,
  onUpdate: (note: Note) => void,
  onDelete: (noteId: string) => void,
): () => void {
  const channel = supabase
    .channel(`notes:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_notes',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(mapNote(payload.new as DBNote));
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_notes',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onUpdate(mapNote(payload.new as DBNote));
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'conversation_notes',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onDelete((payload.old as DBNote).id);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ──────────────────────────────────────────────
// Suscripciones Realtime — contacts & conversations
// ──────────────────────────────────────────────

/**
 * Se suscribe a cambios en la tabla contacts para un usuario específico.
 * Maneja INSERT y UPDATE — cuando el bot/webhook crea un lead nuevo
 * o actualiza un contacto existente, la lista N2 reacciona al instante.
 *
 * @param userId - ID del usuario autenticado (tenant principal)
 * @param onInsert - callback cuando se inserta un contacto
 * @param onUpdate - callback cuando se actualiza un contacto
 * @returns función unsubscribe
 */
export function subscribeToContacts(
  userId: string,
  onInsert: (contact: Contact) => void,
  onUpdate: (contact: Contact) => void,
): () => void {
  const channel = supabase
    .channel(`contacts:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'contacts',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onInsert(mapContact(payload.new as DBContact));
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'contacts',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(mapContact(payload.new as DBContact));
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Se suscribe a cambios en la tabla conversations para un usuario específico.
 * Maneja UPDATE — cuando el trigger `update_conversation_last_message`
 * actualiza `last_message` y `updated_at`, la lista N2 se refresca en vivo.
 *
 * @param userId - ID del usuario autenticado (tenant principal)
 * @param onUpdate - callback con la conversación actualizada
 * @returns función unsubscribe
 */
export function subscribeToConversations(
  userId: string,
  onUpdate: (conversation: DBConversation) => void,
): () => void {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as DBConversation);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}