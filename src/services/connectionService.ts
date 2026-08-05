/**
 * @module connectionService
 * @description Servicio de conexiones User-to-User con Supabase.
 * Módulo puro TypeScript en src/services/ — sin dependencias React.
 * Mapea la tabla: connections (Fase 1 — Grafo social B2C/C2C).
 *
 * Modelo User-to-User:
 *   profiles 1:N connections (requester_id) — quien envía la solicitud
 *   profiles 1:N connections (addressee_id) — quien recibe la solicitud
 *
 * Estados del ENUM connection_status:
 *   'pending'   → solicitud enviada, a la espera de respuesta
 *   'accepted'  → conexión establecida (ambos ven sus posts)
 *   'rejected'  → solicitud rechazada (puede reenviarse)
 *   'blocked'   → bloqueo mutuo (no se pueden ver los posts)
 */

import { supabase } from './supabase';

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface ConnectionWithProfile extends Connection {
  /** Perfil del otro usuario (resuelto según dirección de la consulta) */
  profile?: {
    id: string;
    email?: string | null;
    full_name?: string | null;
  } | null;
}

// ──────────────────────────────────────────────
// Servicios de consulta
// ──────────────────────────────────────────────

/**
 * Obtiene las solicitudes de conexión recibidas por el usuario autenticado
 * (donde él es addressee y el estado es 'pending').
 */
export async function fetchIncomingRequests(): Promise<ConnectionWithProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('connections')
    .select('*, profile:profiles!connections_requester_id_fkey(id, email, full_name)')
    .eq('addressee_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ConnectionWithProfile[];
}

/**
 * Obtiene las conexiones aceptadas del usuario autenticado
 * (solicitudes que envió Y fueron aceptadas, o solicitudes que aceptó).
 */
export async function fetchConnections(): Promise<ConnectionWithProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('connections')
    .select('*, profile:profiles!connections_requester_id_fkey(id, email, full_name)')
    .eq('addressee_id', user.id)
    .eq('status', 'accepted')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // También obtener conexiones donde el usuario es requester (enviadas y aceptadas)
  const { data: sentData, error: sentError } = await supabase
    .from('connections')
    .select('*, profile:profiles!connections_addressee_id_fkey(id, email, full_name)')
    .eq('requester_id', user.id)
    .eq('status', 'accepted')
    .order('updated_at', { ascending: false });

  if (sentError) throw sentError;

  return [...(data || []), ...(sentData || [])] as ConnectionWithProfile[];
}

/**
 * Obtiene el estado de la conexión entre dos usuarios.
 * Retorna null si no existe ninguna relación.
 */
export async function getConnectionStatus(
  otherUserId: string,
): Promise<ConnectionStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('connections')
    .select('status')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`)
    .maybeSingle();

  if (error) throw error;
  return data?.status || null;
}

// ──────────────────────────────────────────────
// Operaciones de escritura (mutaciones)
// ──────────────────────────────────────────────

/**
 * Envía una solicitud de conexión a otro usuario.
 *
 * Reglas:
 *   - No puede conectarse consigo mismo (check en BD)
 *   - El usuario destino debe existir
 *   - Upsert: si ya existe una relación previa ('rejected'), la reactiva
 *     con estado 'pending' (permite reenviar solicitud)
 */
export async function sendConnectionRequest(addresseeId: string): Promise<Connection> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay usuario autenticado');
  if (user.id === addresseeId) throw new Error('No puedes conectarte contigo mismo');

  // Verificar que el usuario destino existe
  const { data: target, error: targetError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', addresseeId)
    .maybeSingle();

  if (targetError) throw targetError;
  if (!target) throw new Error('Usuario destino no encontrado');

  // Verificar si ya existe una relación previa
  const existing = await getConnectionStatus(addresseeId);

  if (existing === 'accepted') {
    throw new Error('Ya estás conectado con este usuario');
  }

  if (existing === 'pending') {
    // Verificar dirección: si el otro usuario ya me envió solicitud, aceptarla
    const { data: reverseReq } = await supabase
      .from('connections')
      .select('id')
      .eq('requester_id', addresseeId)
      .eq('addressee_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (reverseReq) {
      return acceptConnection(reverseReq.id);
    }

    throw new Error('Ya tienes una solicitud pendiente con este usuario');
  }

  if (existing === 'blocked') {
    throw new Error('La conexión con este usuario está bloqueada');
  }

  // Crear nueva solicitud o reactivar una rechazada
  const { data, error } = await supabase
    .from('connections')
    .upsert(
      {
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending',
      },
      {
        onConflict: 'requester_id,addressee_id',
      },
    )
    .select()
    .single();

  if (error) throw error;
  return data as Connection;
}

/**
 * Acepta una solicitud de conexión pendiente.
 * Solo el addressee puede aceptar (RLS también lo protege).
 */
export async function acceptConnection(connectionId: string): Promise<Connection> {
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', connectionId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;

  // Si el usuario autenticado es el addressee, aceptar.
  // RLS garantiza que solo el addressee puede UPDATE su fila.
  return data as Connection;
}

/**
 * Rechaza una solicitud de conexión pendiente.
 * Solo el addressee puede rechazar (RLS lo protege).
 */
export async function rejectConnection(connectionId: string): Promise<void> {
  const { error } = await supabase
    .from('connections')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', connectionId)
    .eq('status', 'pending');

  if (error) throw error;
}

// ──────────────────────────────────────────────
// Tipos para callbacks de Realtime
// ──────────────────────────────────────────────

export interface RealtimeConnectionEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  connection: Connection;
}

/**
 * Se suscribe a cambios en la tabla connections del usuario autenticado.
 * Retorna la función unsubscribe.
 *
 * @param onEvent - callback con el evento y la conexión afectada
 */
export async function subscribeToConnections(
  onEvent: (event: RealtimeConnectionEvent) => void,
): Promise<() => void> {
  const { data: { user } } = await supabase.auth.getUser();

  // Sin usuario autenticado: no hay nada que escuchar
  if (!user) return () => {};

  const channel = supabase
    .channel('connections:mine')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `addressee_id=eq.${user.id}`,
      },
      (payload) => {
        onEvent({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          connection: (payload.new || payload.old) as Connection,
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
