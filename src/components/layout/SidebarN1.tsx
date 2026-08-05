import React from 'react';
import { MessageSquare, Users, Plug, LogOut } from 'lucide-react';

// Envelope type: solo los tabs actuales del sidebar (diseño modular)
export type FeatureTab = 'chats' | 'contacts';

interface SidebarN1Props {
  activeTab: FeatureTab;
  onTabChange: (tab: FeatureTab) => void;
  integrationsEnabled: boolean;
  onToggleIntegrations: (enabled: boolean) => void;
  onLogout?: () => void;
}

export const SidebarN1: React.FC<SidebarN1Props> = ({ 
  activeTab, 
  onTabChange,
  integrationsEnabled,
  onToggleIntegrations,
  onLogout,
}) => {
  // Solo 2 botones de navegación: Chat y Contactos
  const navItems = [
    { id: 'chats' as FeatureTab, label: 'Chats', icon: MessageSquare },
    { id: 'contacts' as FeatureTab, label: 'Contactos', icon: Users },
  ];

  return (
    <aside className="
      w-full md:w-16 h-12 md:h-full
      panel-n1-clean
      flex flex-row md:flex-col items-center justify-between
      px-2 md:px-0 md:py-4 shrink-0 z-10 overflow-x-auto no-scrollbar
      transition-colors duration-200
    ">
      {/* Parte superior: navegación + integraciones (arriba en PC, izquierda en móvil) */}
      <div className="flex flex-row md:flex-col gap-1.5 md:gap-3 items-center w-full justify-start">
        {/* Botones de navegación */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isActive
                  ? 'text-slate-900 bg-black/5 font-bold dark:text-white dark:bg-white/10'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-black/5 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-white/10'
              }`}
            >
              <Icon size={19} />
            </button>
          );
        })}

        {/* ─── Toggle: Integraciones (conexión/plug) ─── */}
        <div className="md:mt-2 md:pt-3 w-auto md:w-full flex justify-center shrink-0">
          <button
            onClick={() => onToggleIntegrations(!integrationsEnabled)}
            title={`Integraciones: ${integrationsEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              integrationsEnabled
                ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-600 hover:bg-black/5 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-white/10'
            }`}
          >
            <Plug size={19} />
          </button>
        </div>
      </div>

      {/* ─── Botón Cerrar Sesión (abajo en PC, derecha en móvil) ─── */}
      {onLogout && (
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="flex w-9 h-9 rounded-xl items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:text-neutral-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors shrink-0"
        >
          <LogOut size={19} />
        </button>
      )}
    </aside>
  );
};