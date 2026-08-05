/**
 * @module ControlProfile
 * @description Componente Capa 3 — Header maestro persistente del módulo Perfil.
 * Actúa como Wrapper de enrutamiento anidado: permite navegar entre
 * Timeline, Contactos y Configuración SIN salir del contexto del Perfil.
 *
 * Diseño asimétrico (DRY):
 * - Lado Izquierdo: título "Perfil" (jerarquía tipográfica text-title).
 * - Lado Derecho: íconos de herramienta (Timeline, Contactos, Configuración,
 *   Crear Post) con microinteracciones active-press + hover-lift y resaltado
 *   condicional según la vista activa.
 *
 * Layout Decoupling: componente puro — solo emite callbacks, no conoce
 * el orquestador (LayoutDemo) ni el estado global del shell.
 */

import React from 'react';
import { Layout, Users, Settings, Plus } from 'lucide-react';

export type ProfileView = 'timeline' | 'contacts' | 'settings';

export interface ControlProfileProps {
  /** Vista activa del sub-módulo Perfil (resaltado condicional de íconos) */
  activeView: ProfileView;
  /** Callback de navegación entre vistas del Perfil (Timeline/Contactos/Config) */
  onChangeView: (view: ProfileView) => void;
  /** Callback al presionar "+" → abre el editor de creación de post */
  onOpenCreatePost: () => void;
  /** Tema del shell maestro (dark/light) para variantes del sandbox */
  isShellDark?: boolean;
}

const VIEW_ICONS: Array<{
  id: ProfileView;
  icon: React.ReactNode;
  label: string;
}> = [
  { id: 'timeline', icon: <Layout size={17} strokeWidth={1.5} />, label: 'Timeline' },
  { id: 'contacts', icon: <Users size={17} strokeWidth={1.5} />, label: 'Contactos' },
  { id: 'settings', icon: <Settings size={17} strokeWidth={1.5} />, label: 'Configuración' },
];

export const ControlProfile: React.FC<ControlProfileProps> = ({
  activeView,
  onChangeView,
  onOpenCreatePost,
  isShellDark = false,
}) => {
  /* El botón de crear post solo está disponible en la vista Timeline */
  const isCreatePostEnabled = activeView === 'timeline';

  return (
    <div
      className={`flex items-center justify-between p-4 flex-shrink-0 transition-colors duration-500 ${
        isShellDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      {/* Lado Izquierdo — Contexto del submódulo */}
      <h2 className={`text-title text-lg font-medium leading-tight truncate ${isShellDark ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
        Perfil
      </h2>

      {/* Lado Derecho — Herramientas del Perfil */}
      <div className="flex items-center gap-3">
        {VIEW_ICONS.map((viewItem) => {
          const isActive = activeView === viewItem.id;
          return (
            <button
              key={viewItem.id}
              type="button"
              onClick={() => onChangeView(viewItem.id)}
              title={viewItem.label}
              aria-pressed={isActive}
              className={`w-9 h-9 rounded-xl flex items-center justify-center active-press hover-lift transition-all ${
                isActive
                  ? isShellDark
                    ? 'text-fuchsia-400 bg-white/15 ring-1 ring-fuchsia-500/40'
                    : 'text-fuchsia-600 bg-fuchsia-500/10 ring-1 ring-fuchsia-500/30'
                  : isShellDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
              }`}
            >
              {viewItem.icon}
            </button>
          );
        })}

        {/* Separador sutil antes del botón de acción principal */}
        <span className={`w-px h-5 flex-shrink-0 ${isShellDark ? 'bg-white/10' : 'bg-black/10'}`} />

        {/* Crear Post — acción principal del Perfil (solo activo en Timeline) */}
        <button
          type="button"
          onClick={onOpenCreatePost}
          disabled={!isCreatePostEnabled}
          aria-disabled={!isCreatePostEnabled}
          title={isCreatePostEnabled ? 'Crear nuevo post' : 'Disponible solo en Timeline'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isCreatePostEnabled
              ? `active-press hover-lift ${
                  isShellDark
                    ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white ring-1 ring-fuchsia-500/40'
                    : 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-[0_8px_20px_rgba(217,70,239,0.25)]'
                }`
              : `cursor-not-allowed opacity-40 ${
                  isShellDark ? 'bg-white/5 text-gray-500' : 'bg-black/5 text-gray-400'
                }`
          }`}
        >
          <Plus size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default ControlProfile;