/**
 * @module useNavigationState
 * @description Hook puro de navegación espacial N1–N4 y dispositivos responsivos.
 * Encapsula el estado de navegación del orquestador ChatsFeature:
 *   - selectedChatId: ID del contacto/chat seleccionado (null = sin selección).
 *   - mobileView:      flujo por capas en móviles ('list' | 'detail' | 'context').
 *   - feedNinjaActive: control de visibilidad del feed central del Modo Ninja.
 *   - isN4Open:        visibilidad del overlay contextual N4.
 *   - activeN4Tab:     tab activo dentro del overlay N4 ('notes' | 'bot' | 'pinned').
 *   - searchQuery:     término de búsqueda del panel N2 (aislado en estado propio
 *                      para evitar renders masivos en los paneles puros).
 *
 * Responsive "1 vs. 2 interacciones":
 *   Móvil (<768px): una sola capa visible a la vez en el flujo:
 *                   list → detail → context.
 *   Desktop (≥768px): N2 + N3 simultáneos; N4 como overlay absoluto sobre N3.
 *
 * Todas las callbacks retornadas son referencias estables (useCallback) para
 * que los paneles puros (ChatN2ListPanel, ChatN3DetailPanel, ChatN4SubDetailPanel)
 * no sufran renders masivos al escribir en la barra de búsqueda.
 */

import { useState, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile';

// ──────────────────────────────────────────────
// Tipos públicos del hook
// ──────────────────────────────────────────────

/** Modo de vista móvil para el flujo por capas: list → detail → context */
export type MobileView = 'list' | 'detail' | 'context';

/** Tab activo dentro del overlay contextual N4 */
export type N4Tab = 'notes' | 'bot' | 'pinned';

/** Estado de navegación espacial N1–N4 */
export interface NavigationState {
  /** ID del contacto/chat seleccionado (null = sin selección) */
  selectedChatId: string | null;
  /** Capa visible en móviles — flujo por capas */
  mobileView: MobileView;
  /** Feed central del Modo Ninja visible */
  feedNinjaActive: boolean;
  /** Panel contextual N4 abierto */
  isN4Open: boolean;
  /** Tab activo en el overlay N4 */
  activeN4Tab: N4Tab;
}

/**
 * Hook puro de navegación espacial y dispositivos responsivos.
 * Administra de forma reactiva la interfaz de navegación N1–N4.
 */
export function useNavigationState() {
  const isMobile = useIsMobile();

  const [navState, setNavState] = useState<NavigationState>({
    selectedChatId: null,
    mobileView: 'list',
    feedNinjaActive: false,
    isN4Open: false,
    activeN4Tab: 'notes',
  });

  // searchQuery aislado en estado propio: los cambios aquí no recrean navState.
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Selecciona un contacto/chat por ID.
   * En móvil conmuta a la capa 'detail' (N3 a pantalla completa).
   * Fuerza un reset defensivo cerrando el panel contextual N4.
   */
  const handleSelectContact = useCallback((contactId: string) => {
    setNavState((prev) => ({
      ...prev,
      selectedChatId: contactId,
      isN4Open: false,
      mobileView: isMobile ? 'detail' : prev.mobileView,
    }));
  }, [isMobile]);

  /**
   * Cierra N3: limpia la selección activa.
   * En móvil regresa a la capa 'list' (N2).
   * Fuerza la limpieza del contexto cerrando N4.
   */
  const handleCloseN3 = useCallback(() => {
    setNavState((prev) => ({
      ...prev,
      selectedChatId: null,
      isN4Open: false,
      mobileView: isMobile ? 'list' : prev.mobileView,
    }));
  }, [isMobile]);

  /**
   * Abre el overlay contextual N4 con el tab indicado.
   * En móvil conmuta a la capa 'context' para desplegar N4 a pantalla completa.
   */
  const handleOpenN4 = useCallback((tab: N4Tab) => {
    setNavState((prev) => ({
      ...prev,
      isN4Open: true,
      activeN4Tab: tab,
      mobileView: isMobile ? 'context' : prev.mobileView,
    }));
  }, [isMobile]);

  /**
   * Cierra N4: oculta el overlay contextual.
   * En móvil restaura la vista 'detail' para regresar a la conversación N3.
   */
  const handleCloseN4 = useCallback(() => {
    setNavState((prev) => ({
      ...prev,
      isN4Open: false,
      mobileView: isMobile ? 'detail' : prev.mobileView,
    }));
  }, [isMobile]);

  /**
   * Alterna el estado booleano del Feed Ninja.
   * Aplica un reset defensivo: si se activa, cierra N4 y limpia selectedChatId
   * para evitar fugas de contexto visual.
   * En móvil sincroniza la capa visible:
   *   - Activar  → 'detail' (N3 al 100% muestra FeedNinjaDetail).
   *   - Desactivar → 'list' (N2 muestra lista de conversaciones).
   */
  const handleToggleFeedNinja = useCallback(() => {
    setNavState((prev) => {
      const nextFeedNinjaActive = !prev.feedNinjaActive;
      return {
        ...prev,
        feedNinjaActive: nextFeedNinjaActive,
        // Reset defensivo al activar: evitar fugas de contexto visual
        isN4Open: nextFeedNinjaActive ? false : prev.isN4Open,
        selectedChatId: nextFeedNinjaActive ? null : prev.selectedChatId,
        mobileView: isMobile
          ? nextFeedNinjaActive
            ? 'detail'
            : 'list'
          : prev.mobileView,
      };
    });
  }, [isMobile]);

  /** Actualiza el término de búsqueda N2 de forma inmediata. */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    navState,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    handleSelectContact,
    handleCloseN3,
    handleOpenN4,
    handleCloseN4,
    handleToggleFeedNinja,
    isMobile,
  };
}