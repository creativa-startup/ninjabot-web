/**
 * @module NotificationsN3DetailPanel
 * @description Panel N3 — Módulo Notificaciones (Detalle de una alerta global).
 * Etapa 2: componente funcional independiente, inyectado en el espacio físico N3
 * del LayoutDemo.tsx mediante el principio de Layout Decoupling.
 *
 * Estética Premium UX/UI Card: fondos translúcidos con blur, bordes invisibles
 * (border-black/5 claro / border-white/10 oscuro), sin cajas grises sólidas.
 */

import React from 'react';
import { ChevronLeft, Bell, MessageCircle, Heart, ShoppingBag, ShieldAlert, UserPlus, Send, Check, Archive } from 'lucide-react';
import { DEMO_NOTIFICATIONS } from './mockNotifications';
import type { NotificationCategory } from './mockNotifications';

const CATEGORY_META: Record<NotificationCategory, { icon: React.ReactNode; color: string; label: string }> = {
  chat: { icon: <MessageCircle size={18} />, color: '#25D366', label: 'Chat' },
  comentario: { icon: <Heart size={18} />, color: '#DD2A7B', label: 'Comentario' },
  venta: { icon: <ShoppingBag size={18} />, color: '#F59E0B', label: 'Venta' },
  lead: { icon: <UserPlus size={18} />, color: '#1877F2', label: 'Lead' },
  sistema: { icon: <ShieldAlert size={18} />, color: '#8B5CF6', label: 'Sistema' },
};

export interface NotificationsN3DetailPanelProps {
  notificationId?: string | null;
  onBackClick?: () => void;
  isShellDark?: boolean;
}

const shell = (dark: boolean) =>
  dark
    ? { root: 'bg-transparent text-white', header: 'bg-transparent', body: 'bg-transparent', card: 'glass-card-dark', text: 'text-white', sub: 'text-gray-500', title: 'text-gray-300', back: 'text-gray-400 hover:bg-white/10 hover:text-white', badge: 'bg-white/5 border-white/10 text-fuchsia-300', empty: 'text-gray-700', emptyText: 'text-gray-400', emptyHint: 'text-gray-600', action: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30', secondary: 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' }
    : { root: 'bg-transparent text-gray-900', header: 'bg-white/80 backdrop-blur-md', body: 'bg-transparent', card: 'bg-white/80 backdrop-blur-md border-black/5', text: 'text-gray-900', sub: 'text-gray-500', title: 'text-gray-700', back: 'text-gray-500 hover:bg-black/5 hover:text-gray-700', badge: 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700', empty: 'text-gray-300', emptyText: 'text-gray-500', emptyHint: 'text-gray-400', action: 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700 hover:bg-fuchsia-500/20', secondary: 'bg-white/60 border-black/5 text-gray-700 hover:bg-black/5' };

export const NotificationsN3DetailPanel: React.FC<NotificationsN3DetailPanelProps> = ({ notificationId = null, onBackClick, isShellDark = false }) => {
  const s = shell(isShellDark);
  const notif = DEMO_NOTIFICATIONS.find((n) => n.id === notificationId) ?? null;

  if (!notif) {
    return (
      <div className={`w-full h-full flex flex-col overflow-hidden transition-colors duration-500 ${s.root}`}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Bell size={40} className={`${s.empty} mb-3`} />
          <h3 className={`text-base font-semibold ${s.text}`}>Notificaciones</h3>
          <p className={`text-sm mt-1.5 leading-relaxed max-w-xs ${s.emptyHint}`}>Selecciona una alerta para ver su detalle completo.</p>
        </div>
      </div>
    );
  }

  const meta = CATEGORY_META[notif.category];

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${s.root}`}>
      {/* Cabecera N3 */}
      <div className={`flex items-center gap-3 p-4 flex-shrink-0 transition-colors duration-500 ${s.header}`}>
        <button type="button" onClick={onBackClick} title="Volver a notificaciones" className={`md:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${s.back}`}>
          <ChevronLeft size={18} />
        </button>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border`} style={{ backgroundColor: `${meta.color}15`, borderColor: `${meta.color}30`, color: meta.color }}>
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-sm truncate ${s.text}`}>{notif.title}</p>
          <p className={`text-xs truncate ${s.sub}`}>{notif.time}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${s.badge}`}>
          {meta.label}
        </span>
      </div>

      {/* Cuerpo N3 — Detalle de la notificación */}
      <div className={`flex-1 overflow-y-auto ${s.body}`}>
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Mensaje completo */}
          <div className={`rounded-2xl p-5 border transition-colors duration-500 ${s.card}`}>
            <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-2 ${s.sub}`}>Mensaje</h4>
            <p className={`text-sm leading-relaxed ${s.title}`}>{notif.message}</p>
            {notif.channelLabel && (
              <span className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isShellDark ? 'bg-white/5 border-white/10 text-fuchsia-300' : 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700'}`}>
                {notif.channelLabel}
              </span>
            )}
          </div>

          {/* Estado de lectura */}
          <div className={`rounded-2xl p-4 border transition-colors duration-500 ${s.card}`}>
            <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-2 ${s.sub}`}>Estado</h4>
            <div className="flex items-center gap-2">
              {notif.read ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isShellDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-700'}`}>
                  <Check size={12} />
                  Leída
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isShellDark ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400' : 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700'}`}>
                  Sin leer
                </span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2.5">
            {notif.actionLabel && (
              <button type="button" className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${s.action}`}>
                <Send size={16} />
                {notif.actionLabel}
              </button>
            )}
            <button type="button" className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${s.secondary}`}>
              <Archive size={16} />
              Archivar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsN3DetailPanel;