/**
 * @module useActiveEntity
 * @description Hook puro de resolución de tenant (entidad de origen) y filtros
 * de plataforma de bajo nivel para alimentar las listas del panel N2.
 *
 * Encapsula la lógica que vivía en el orquestador ChatsFeature:
 *   - Inicialización inteligente del activeEntity desde el auth_source
 *     del usuario autenticado (primera vez → ahorra un clic de config).
 *   - Mapeo de filtros derivados (filterMode + platformFilter) basado en
 *     la entidad activa, memoizado con useMemo para estabilidad de
 *     referencias y protección contra re-renders masivos en paneles puros.
 *
 * Mapeo:
 *   - auth_source 'facebook' → activeEntity 'facebook'
 *   - auth_source 'google' o 'ninjabot' → activeEntity 'ninjabot'
 *   - Cualquier otro → 'all'
 *
 * Filtros derivados:
 *   - 'ninjabot' → filterMode 'social_feed' (Ninjazs/Modo Ninja) + platformFilter 'ninjabot'
 *   - 'facebook' → filterMode 'conversaciones' + platformFilter 'ninjabot'
 *   - 'whatsapp'/'instagram'/'messenger' → filterMode 'conversaciones' + platformFilter <canal>
 *   - 'all' → filterMode 'conversaciones' + platformFilter 'all'
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FilterMode, PlatformFilter, EntityFilter } from '../../../types';

// ──────────────────────────────────────────────
// Tipos públicos del hook
// ──────────────────────────────────────────────

export interface UseActiveEntityOptions {
  /** Entidad inicial explícita (sandbox/pruebas). Si se provee, no se sincroniza con authSource */
  initialEntity?: EntityFilter;
}

/**
 * Hook puro de resolución de entidad activa y filtros derivados.
 *
 * @param authSource - Origen de registro del usuario autenticado
 *   (profiles.auth_source): 'google' | 'facebook' | 'ninjabot' | undefined.
 * @param options - Configuración opcional (entidad inicial explícita).
 * @returns Estado de entidad y filtros derivados + callback de cambio.
 */
export function useActiveEntity(
  authSource?: string,
  options: UseActiveEntityOptions = {},
) {
  const { initialEntity } = options;

  // ── Estado: Entidad activa (canal/entidad de visualización) ──
  const [activeEntity, setActiveEntity] = useState<EntityFilter>(
    initialEntity ?? 'all',
  );

  // ── Efecto de Sincronización de Origen ──
  // Si no hay entidad inicial explícita y el authSource cambia (primer login
  // o cambio de cuenta), inicializa la entidad activa según el origen para
  // evitar que el usuario tenga que configurar el filtro manualmente.
  useEffect(() => {
    if (initialEntity) return;

    const source = (authSource || '').toLowerCase();

    // Mapeo inteligente: facebook → 'facebook'; google/ninjabot → 'ninjabot';
    // desconocido/ausente → 'all' (sin filtro de entidad).
    if (source === 'facebook') {
      setActiveEntity('facebook');
    } else if (source === 'google' || source === 'ninjabot') {
      setActiveEntity('ninjabot');
    } else {
      setActiveEntity('all');
    }
  }, [authSource, initialEntity]);

  // ── Filtros de Bajo Nivel Derivados (useMemo) ──
  // Mapea la entidad activa a filterMode + platformFilter con referencias
  // estables para proteger los paneles puros contra re-renders masivos.
  const { filterMode, platformFilter } = useMemo(() => {
    switch (activeEntity) {
      case 'ninjabot':
        // Ninjazs/Modo Ninja → feed social nativo
        return { filterMode: 'social_feed' as FilterMode, platformFilter: 'ninjabot' as PlatformFilter };
      case 'facebook':
        // Grupo fuente nativa (nativos + Google + Facebook) → conversaciones
        return { filterMode: 'conversaciones' as FilterMode, platformFilter: 'ninjabot' as PlatformFilter };
      case 'whatsapp':
      case 'instagram':
      case 'messenger':
        // Canales externos conectados: filtrar por canal concreto
        return { filterMode: 'conversaciones' as FilterMode, platformFilter: activeEntity as PlatformFilter };
      // 'all' → conversaciones sin filtro de plataforma
      default:
        return { filterMode: 'conversaciones' as FilterMode, platformFilter: 'all' as PlatformFilter };
    }
  }, [activeEntity]);

  // ── Handler: Conmutar entidad activa ──
  const handleEntityChange = useCallback((entity: EntityFilter) => {
    setActiveEntity(entity);
  }, []);

  return {
    /** Entidad o canal de visualización activo */
    activeEntity,
    /** Modo de vista de bajo nivel para las listas N2 */
    filterMode,
    /** Filtro de plataforma efectivo para las listas N2 */
    platformFilter,
    /** Callback para conmutar la entidad activa */
    handleEntityChange,
  };
}

export default useActiveEntity;