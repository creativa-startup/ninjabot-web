/**
 * @module ControlProfileTabs
 * @description Control de navegación por pestañas del perfil del creador (Social Commerce, Etapa 3).
 * Graduado desde el Sandbox (src/demo/ControlProfileTabs.tsx) a producción.
 * Permite alternar entre la vista "Feed" (contenido orgánico) y "Store" (tienda / catálogo de productos
 * mapeado a Meta Commerce API).
 *
 * Sistema de Diseño — Capa 1 (Tokens y Superficies):
 * - Bordes rectos estrictos: rounded-none en todo el contenedor.
 * - Tab activo: text-title + línea inferior fina (border-b-2) con contraste alto.
 * - Tab inactivo: opacidad tipográfica reducida (equivalente al rol visual de text-secondary).
 *
 * Componente puro [Control]: solo recibe props (activeTab + onTabChange) y delega la navegación
 * al orquestador que lo monta (ej. ProfileN3DetailPanel en producción).
 */

import React from 'react';

export type ProfileTab = 'feed' | 'store';

export interface ControlProfileTabsProps {
  /** Pestaña actualmente activa */
  activeTab: ProfileTab;
  /** Callback al cambiar de pestaña (feed ↔ store) */
  onTabChange: (tab: ProfileTab) => void;
  /** Tema del shell padre (dark/light) para adaptar la línea inferior del tab activo */
  isDark?: boolean;
}

interface TabItem {
  id: ProfileTab;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'store', label: 'Tienda' },
];

export const ControlProfileTabs: React.FC<ControlProfileTabsProps> = ({
  activeTab,
  onTabChange,
  isDark = false,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Navegación del perfil"
      className="flex flex-row items-stretch w-full rounded-none select-none"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 relative py-3 px-4 text-sm font-medium tracking-wide text-center transition-colors duration-300 rounded-none cursor-pointer active-press border-b-2 ${
              isActive
                ? 'text-title border-black/90 dark:border-white/10'
                : isDark
                  ? 'text-gray-400/70 hover:text-white/70 border-transparent'
                  : 'text-gray-400/70 hover:text-gray-700 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ControlProfileTabs;