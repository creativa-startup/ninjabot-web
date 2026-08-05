/**
 * @module useChatsData
 * @description Custom hook que conecta el chatService de Supabase con los
 * componentes React del módulo Chats. Gestiona:
 *   - Carga inicial de contactos, mensajes y notas desde Supabase
 *   - Suscripciones Realtime para sincronización instantánea en N3 y N4
 *   - Operaciones CRUD (sendMessage, addNote, editNote, deleteNote)
 *   - Estados de carga y error para renderizado condicional
 *
 * Single Source of Truth: los datos viven en Supabase, este hook los consume
 * y los expone como estado local React.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Contact, Message, Note, PlatformConnection } from '../types';
import { supabase } from '../services/supabase';
import {
  fetchContactsWithConversations,
  fetchMessagesByContact,
  fetchNotesByContact,
  fetchAllNotes,
  sendMessage as sendMessageToDB,
  addNote as addNoteToDB,
  editNote as editNoteToDB,
  deleteNote as deleteNoteToDB,
  subscribeToMessages,
  subscribeToNotes,
  subscribeToContacts,
  subscribeToConversations,
} from '../services/chatService';

export interface ChatsDataState {
  /** Lista de contactos con sus conversaciones */
  contacts: Contact[];
  /** Mapa contactId -> Message[] */
  messagesByContact: Record<string, Message[]>;
  /** Mapa contactId -> Note[] */
  notesByContact: Record<string, Note[]>;
  /** Todas las notas planas (para ser filtradas en ChatsFeature) */
  allNotes: Note[];
  /** Estado de conexión de plataformas */
  platformStatus: Record<string, PlatformConnection>;
  /** Indicador de carga inicial */
  isLoading: boolean;
  /** Error si ocurrió uno */
  error: string | null;
}

export interface ChatsDataActions {
  /** Enviar un mensaje en una conversación */
  sendMessage: (contactId: string, text: string, isFromUser?: boolean) => Promise<void>;
  /** Agregar una nota */
  addNote: (contactId: string, text: string) => Promise<void>;
  /** Editar una nota */
  editNote: (noteId: string, newText: string) => Promise<void>;
  /** Eliminar una nota */
  deleteNote: (noteId: string) => Promise<void>;
  /** Recargar todos los datos desde Supabase */
  reload: () => Promise<void>;
  /** Cargar mensajes de un contacto específico */
  loadMessages: (contactId: string) => Promise<void>;
  /** Cargar notas de un contacto específico */
  loadNotes: (contactId: string) => Promise<void>;
}

/**
 * Hook principal que orquesta los datos de chats desde Supabase.
 *
 * @param autoConnect - Si true (default), carga datos automáticamente al montar.
 */
export function useChatsData(autoConnect = true): ChatsDataState & ChatsDataActions {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Message[]>>({});
  const [notesByContact, setNotesByContact] = useState<Record<string, Note[]>>({});
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [platformStatus, setPlatformStatus] = useState<Record<string, PlatformConnection>>({
    whatsapp: 'disconnected',
    messenger: 'disconnected',
    instagram: 'disconnected',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs para almacenar los unsubscribe de Realtime
  const messageSubscriptions = useRef<Map<string, () => void>>(new Map());
  const noteSubscriptions = useRef<Map<string, () => void>>(new Map());
  const contactsSubscription = useRef<(() => void) | null>(null);
  const conversationsSubscription = useRef<(() => void) | null>(null);

  // ──────────────────────────────────────────
  // Limpieza de suscripciones al desmontar
  // ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      messageSubscriptions.current.forEach((unsub) => unsub());
      noteSubscriptions.current.forEach((unsub) => unsub());
      messageSubscriptions.current.clear();
      noteSubscriptions.current.clear();
      contactsSubscription.current?.();
      contactsSubscription.current = null;
      conversationsSubscription.current?.();
      conversationsSubscription.current = null;
    };
  }, []);

  // ──────────────────────────────────────────
  // Carga inicial
  // ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedContacts = await fetchContactsWithConversations();
      setContacts(fetchedContacts);

      // ── Suscripción Realtime Total ──
      // contacts (INSERT/UPDATE) + conversations (UPDATE por el trigger last_message)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Limpiar suscripciones previas antes de recrear (idempotente)
        contactsSubscription.current?.();
        contactsSubscription.current = null;
        conversationsSubscription.current?.();
        conversationsSubscription.current = null;

        // contacts: INSERT — nuevo lead del bot/webhook aparece al instante en N2
        contactsSubscription.current = subscribeToContacts(
          user.id,
          (newContact) => {
            setContacts((prev) => {
              if (prev.some((c) => c.id === newContact.id)) return prev;
              return [newContact, ...prev];
            });
          },
          // contacts: UPDATE — cambios directos al contacto se reflejan en vivo
          (updatedContact) => {
            setContacts((prev) =>
              prev.map((c) => (c.id === updatedContact.id ? { ...c, ...updatedContact } : c))
            );
          },
        );

        // conversations: UPDATE — el trigger update_conversation_last_message
        // dispara este evento tras cada mensaje nuevo (last_message + updated_at)
        conversationsSubscription.current = subscribeToConversations(user.id, (conv) => {
          setContacts((prev) =>
            prev.map((c) => {
              if (c.id !== conv.contact_id) return c;
              const date = new Date(conv.updated_at);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const lastTime =
                diffHours < 1
                  ? 'Ahora'
                  : diffHours < 24
                    ? date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
                    : date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
              return {
                ...c,
                lastMessage: conv.last_message || c.lastMessage,
                lastTime,
              };
            })
          );
        });
      }

      // Cargar todas las notas una vez
      const fetchedAllNotes = await fetchAllNotes();
      setAllNotes(fetchedAllNotes);

      // Agrupar notas por contactId
      const notesMap: Record<string, Note[]> = {};
      fetchedAllNotes.forEach((note) => {
        if (!notesMap[note.contactId]) notesMap[note.contactId] = [];
        notesMap[note.contactId].push(note);
      });
      setNotesByContact(notesMap);

      // Platform status — por ahora inferido de los contactos
      const hasWhatsApp = fetchedContacts.some((c) => c.platform === 'whatsapp');
      const hasMessenger = fetchedContacts.some((c) => c.platform === 'messenger');
      const hasInstagram = fetchedContacts.some((c) => c.platform === 'instagram');
      setPlatformStatus({
        whatsapp: hasWhatsApp ? 'connected' : 'disconnected',
        messenger: hasMessenger ? 'connected' : 'disconnected',
        instagram: hasInstagram ? 'connected' : 'disconnected',
      });
    } catch (err: any) {
      console.error('[useChatsData] Error loading data:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [autoConnect, loadData]);

  // ──────────────────────────────────────────
  // Cargar mensajes de un contacto y suscribirse
  // ──────────────────────────────────────────
  const loadMessages = useCallback(async (contactId: string) => {
    try {
      const messages = await fetchMessagesByContact(contactId);
      setMessagesByContact((prev) => ({ ...prev, [contactId]: messages }));

      // Suscribirse a nuevos mensajes en tiempo real
      // Primero obtener conversationId desde los mensajes cargados
      if (messages.length > 0) {
        // Ya tenemos mensajes — ver si ya hay suscripción
        if (!messageSubscriptions.current.has(contactId)) {
          // Necesitamos el conversationId — lo obtenemos de la DB
          const { data: conv } = await supabase
            .from('conversations')
            .select('id')
            .eq('contact_id', contactId)
            .eq('status', 'active')
            .maybeSingle();

          if (conv) {
            const unsubscribe = subscribeToMessages(conv.id, (newMessage) => {
              setMessagesByContact((prev) => {
                const existing = prev[contactId] || [];
                // Evitar duplicados
                if (existing.some((m) => m.id === newMessage.id)) return prev;
                return { ...prev, [contactId]: [...existing, newMessage] };
              });
            });
            messageSubscriptions.current.set(contactId, unsubscribe);
          }
        }
      }
    } catch (err: any) {
      console.error(`[useChatsData] Error loading messages for ${contactId}:`, err);
    }
  }, []);

  // ──────────────────────────────────────────
  // Cargar notas de un contacto y suscribirse
  // ──────────────────────────────────────────
  const loadNotes = useCallback(async (contactId: string) => {
    try {
      const notes = await fetchNotesByContact(contactId);
      setNotesByContact((prev) => ({ ...prev, [contactId]: notes }));

      // Suscribirse a cambios en notas en tiempo real
      if (!noteSubscriptions.current.has(contactId)) {
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('contact_id', contactId)
          .eq('status', 'active')
          .maybeSingle();

        if (conv) {
          const unsubscribe = subscribeToNotes(
            conv.id,
            // onInsert
            (note) => {
              setNotesByContact((prev) => {
                const existing = prev[contactId] || [];
                if (existing.some((n) => n.id === note.id)) return prev;
                return { ...prev, [contactId]: [...existing, note] };
              });
              setAllNotes((prev) => {
                if (prev.some((n) => n.id === note.id)) return prev;
                return [...prev, note];
              });
            },
            // onUpdate
            (note) => {
              setNotesByContact((prev) => {
                const existing = prev[contactId] || [];
                return {
                  ...prev,
                  [contactId]: existing.map((n) => (n.id === note.id ? note : n)),
                };
              });
              setAllNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
            },
            // onDelete
            (noteId) => {
              setNotesByContact((prev) => ({
                ...prev,
                [contactId]: (prev[contactId] || []).filter((n) => n.id !== noteId),
              }));
              setAllNotes((prev) => prev.filter((n) => n.id !== noteId));
            },
          );
          noteSubscriptions.current.set(contactId, unsubscribe);
        }
      }
    } catch (err: any) {
      console.error(`[useChatsData] Error loading notes for ${contactId}:`, err);
    }
  }, []);

  // ──────────────────────────────────────────
  // Acciones CRUD
  // ──────────────────────────────────────────

  const sendMessage = useCallback(async (contactId: string, text: string, _isFromUser?: boolean) => {
    try {
      const sender = _isFromUser ? 'user' : 'agent';
      await sendMessageToDB(contactId, text, sender);
      // El Realtime se encargará de reflejar el mensaje en la UI
    } catch (err: any) {
      console.error('[useChatsData] Error sending message:', err);
    }
  }, []);

  const addNote = useCallback(async (contactId: string, text: string) => {
    try {
      await addNoteToDB(contactId, text);
      // Realtime se encarga de actualizar la UI
    } catch (err: any) {
      console.error('[useChatsData] Error adding note:', err);
    }
  }, []);

  const editNote = useCallback(async (noteId: string, newText: string) => {
    try {
      await editNoteToDB(noteId, newText);
      // Realtime se encarga de actualizar la UI
    } catch (err: any) {
      console.error('[useChatsData] Error editing note:', err);
    }
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await deleteNoteToDB(noteId);
      // Realtime se encarga de actualizar la UI
    } catch (err: any) {
      console.error('[useChatsData] Error deleting note:', err);
    }
  }, []);

  return {
    contacts,
    messagesByContact,
    notesByContact,
    allNotes,
    platformStatus,
    isLoading,
    error,
    sendMessage,
    addNote,
    editNote,
    deleteNote,
    reload: loadData,
    loadMessages,
    loadNotes,
  };
}