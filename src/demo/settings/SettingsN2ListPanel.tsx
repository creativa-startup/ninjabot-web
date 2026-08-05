/**
 * @module SettingsN2ListPanel
 * @description Panel lateral N2 — Módulo Configuraciones del Perfil del Creador.
 * Lista los 7 módulos de configuración (Cuenta, Integraciones, Tienda, Tickets,
 * Ninjabot, Dashboard, Apariencia) con soporte para badges opcionales.
 *
 * Layout Decoupling: componente puro — recibe callbacks por props y no conoce
 * el orquestador (LayoutDemo). El header maestro (ControlProfile) vive en N1.
 *
 * Estética Premium UX/UI Card: fondos translúcidos con blur, bordes invisibles
 * (border-black/5 claro / border-white/10 oscuro), sin sombras pesadas.
 */

import React from 'react';
import { User, Plug, ShoppingBag, Ticket, Zap, LayoutDashboard, Palette } from 'lucide-react';
import { SETTINGS_MODULES, type SettingsModule } from './mockSettings';
import type { SettingsView } from './mockSettings';

export interface SettingsN2ListPanelProps {
  /** Callback al seleccionar un módulo de configuración → navegación N2 → N3 */
  onSelectGroup: (view: SettingsView) => void;
  /** Vista activa de configuración (id del módulo resaltado) */
  activeView?: SettingsView | null;
  /** Tema del shell maestro (dark/light) para variantes del sandbox */
  isShellDark?: boolean;
}

/* Mapeo de iconos lucide por clave del módulo */
const MODULE_ICONS: Record<string, React.ReactNode> = {
  user: <User size={17} strokeWidth={1.5} />,
  plug: <Plug size={17} strokeWidth={1.5} />,
  'shopping-bag': <ShoppingBag size={17} strokeWidth={1.5} />,
  ticket: <Ticket size={17} strokeWidth={1.5} />,
  zap: <Zap size={17} strokeWidth={1.5} />,
  'layout-dashboard': <LayoutDashboard size={17} strokeWidth={1.5} />,
  palette: <Palette size={17} strokeWidth={1.5} />,
};

export const SettingsN2ListPanel: React.FC<SettingsN2ListPanelProps> = ({
  onSelectGroup,
  activeView = null,
  isShellDark = false,
}) => {
  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${
        isShellDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
      }`}
    >
      {/* ─── Header N2: resumen de módulos ─── */}
      <div
        className={`px-4 pt-4 pb-3 flex-shrink-0 transition-colors duration-500 ${
          isShellDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md'
        }`}
      >
        <h3 className={`text-sm font-semibold leading-tight ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
          Configuración
        </h3>
        <p className={`text-[10px] mt-0.5 ${isShellDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {SETTINGS_MODULES.length} módulos · perfil del creador
        </p>
      </div>

      {/* ─── Lista de módulos de configuración ─── */}
      <div className="flex-1 overflow-y-auto">
        {SETTINGS_MODULES.map((module: SettingsModule) => {
          const isSelected = module.id === activeView;
          const icon = MODULE_ICONS[module.icon] ?? MODULE_ICONS.user;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelectGroup(module.id)}
              aria-pressed={isSelected}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 active:scale-[0.99] ${
                isSelected
                  ? isShellDark
                    ? 'bg-white/5'
                    : 'bg-fuchsia-500/[0.06]'
                  : isShellDark
                    ? 'bg-transparent hover:bg-white/5 hover:text-white'
                    : 'bg-transparent hover:bg-black/[0.03]'
              }`}
            >
              {/* Ícono del módulo */}
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? isShellDark
                      ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/30'
                      : 'bg-fuchsia-500/10 text-fuchsia-700 ring-1 ring-fuchsia-500/20'
                    : isShellDark
                      ? 'bg-white/5 text-gray-400'
                      : 'bg-black/5 text-gray-500'
                }`}
              >
                {icon}
              </span>

              {/* Nombre del módulo */}
              <span className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${
                  isSelected
                    ? isShellDark
                      ? 'text-[#e056fd]'
                      : 'text-gray-900'
                    : isShellDark
                      ? 'text-white/60'
                      : 'text-gray-900'
                }`}>
                  {module.label}
                </span>
                <span className={`block text-[10px] truncate mt-0.5 ${isShellDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {module.description}
                </span>
              </span>

              {/* Badge opcional de notificaciones */}
              {module.badge !== undefined && module.badge > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold text-white leading-none flex-shrink-0 ${
                    isShellDark
                      ? 'bg-fuchsia-500 border border-fuchsia-400/40'
                      : 'bg-fuchsia-600 border border-fuchsia-500/30'
                  }`}
                >
                  {module.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsN2ListPanel;