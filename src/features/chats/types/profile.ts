/**
 * @module profile
 * @description Tipos independientes del Perfil Ninjat público (Club Privado /@handle).
 *
 * Este módulo rompe la dependencia circular entre el hook useNinjatProfile y el
 * panel visual ProfileN3DetailPanel, centralizando los contratos de identidad
 * y estadísticas en un único lugar neutral.
 *
 * Alineación con el esquema REAL de la base de datos (Supabase):
 * - Tabla `profiles`: las columnas `handle` y `avatar_url` son OPCIONALES/NULAS
 *   (nullable) → se declaran explícitamente como `string | null` para evitar
 *   fallos de compilación estricta.
 */

/** Identidad del creador recuperada de la tabla `profiles` (Supabase). */
export interface NinjatProfile {
  /** ID del usuario (UUID de auth.users) */
  id: string;
  /** Nombre completo o comercial del creador */
  full_name: string;
  /** Correo del creador (visible en el Club Privado) */
  email: string;
  /** Handle único del creador — nullable en el esquema real */
  handle: string | null;
  /** URL del avatar del creador — opcional y nullable en producción */
  avatar_url?: string | null;
  /** Entidad de origen del registro: 'ninjabot' | 'google' | 'facebook' */
  auth_source: string;
  /** Teléfono del creador (opcional) */
  phone?: string | null;
  /** ID de la empresa/tenant multi-tenant (opcional) */
  company_id?: string | null;
  /** Timestamp ISO de creación del perfil (opcional) */
  created_at?: string | null;
}

/** Estadísticas reactivas del perfil del creador para alimentar el header. */
export interface NinjatProfileStats {
  /** Longitud del histórico de posts del creador */
  totalNinjats: number;
  /** Suma acumulada de likes de todos sus posts */
  totalLikes: number;
  /** Suma acumulada de shares de todos sus posts */
  totalShares: number;
}