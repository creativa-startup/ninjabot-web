import React from 'react';
import { Bell } from 'lucide-react';
import { NinjabotLogo } from '../common/NinjabotLogo';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from './ThemeToggle';

interface GlobalHeaderProps {
  /** Cantidad de notificaciones no leídas (badge contador) */
  notificationCount?: number;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ notificationCount = 0 }) => {
  const badgeCount = notificationCount > 99 ? '99+' : notificationCount;

  return (
    <header className="h-14 panel-header-clean px-3 sm:px-4 flex justify-between items-center shrink-0 z-20 transition-colors duration-200">
      {/* ─── Lado izquierdo: Logo + marca ─── */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <NinjabotLogo
          variant="color"
          size="md"
          className="shrink-0"
        />
        <div className="min-w-0">
          <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-wide leading-tight truncate">
            Ninjazs
          </h1>
        </div>
      </div>

      {/* ─── Lado derecho: switch de tema + notificación ─── */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* Icono de notificación con badge contador */}
        <button
          type="button"
          title="Notificaciones"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
        >
          <Bell className="w-5 h-5" strokeWidth={2} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 text-[9px] font-bold rounded-full flex items-center justify-center text-white leading-none bg-red-500 border-2 border-white/70 dark:border-black/70">
              {badgeCount}
            </span>
          )}
        </button>

        {/* Avatar del Perfil — componente atómico Capa 2 solo */}
        <button
          type="button"
          title="Perfil"
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        >
          <Avatar fallback="JD" size="sm" className="border-0" />
        </button>
      </div>
    </header>
  );
};