/**
 * @module NotificationsN2ListPanel
 * @description Esqueleto visual (wireframe) del Panel N2 — Módulo Notificaciones.
 * Etapa 2: componente funcional independiente, inyectado en el espacio físico N2
 * del LayoutDemo.tsx mediante el principio de Layout Decoupling.
 */

import React, { useMemo, useState } from 'react';
import { Bell, Search, MessageCircle, Heart, ShoppingBag, ShieldAlert, UserPlus, ChevronRight } from 'lucide-react';
import { DEMO_NOTIFICATIONS } from './mockNotifications';
import type { NotificationCategory } from './mockNotifications';

type CategoryFilter = 'all' | NotificationCategory;

const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'chat', label: 'Chats' },
  { id: 'comentario', label: 'Comentarios' },
  { id: 'venta', label: 'Ventas' },
  { id: 'lead', label: 'Leads' },
  { id: 'sistema', label: 'Sistema' },
];

const CATEGORY_META: Record<NotificationCategory, { icon: React.ReactNode; color: string }> = {
  chat: { icon: <MessageCircle size={15} />, color: '#25D366' },
  comentario: { icon: <Heart size={15} />, color: '#DD2A7B' },
  venta: { icon: <ShoppingBag size={15} />, color: '#F59E0B' },
  lead: { icon: <UserPlus size={15} />, color: '#1877F2' },
  sistema: { icon: <ShieldAlert size={15} />, color: '#8B5CF6' },
};

export interface NotificationsN2ListPanelProps {
  onSelectNotification: (notificationId: string) => void;
  selectedId?: string | null;
  isShellDark?: boolean;
}

const shell = (dark: boolean) =>
  dark
    ? { root: 'bg-transparent text-white', header: 'bg-transparent', icon: 'bg-white/10 text-fuchsia-400', text: 'text-white', sub: 'text-gray-500', list: 'bg-transparent', card: 'hover:bg-white/5', selected: 'bg-white/10', badge: 'bg-white/5 border-white/10 text-fuchsia-300', chevron: 'text-gray-600', empty: 'text-gray-700', emptyText: 'text-gray-400', emptyHint: 'text-gray-600', search: 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-fuchsia-500/50', searchIcon: 'text-gray-500', chipOn: 'bg-gray-900 text-white', chipOff: 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white', filterBar: 'bg-transparent', time: 'text-gray-600', unread: 'bg-fuchsia-500 text-white', readDot: 'bg-white/10' }
    : { root: 'bg-transparent text-gray-900', header: 'bg-white/80 backdrop-blur-md', icon: 'bg-brand text-white', text: 'text-gray-900', sub: 'text-gray-500', list: 'bg-transparent', card: 'hover:bg-black/5', selected: 'bg-black/5', badge: 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700', chevron: 'text-gray-300', empty: 'text-gray-300', emptyText: 'text-gray-500', emptyHint: 'text-gray-400', search: 'bg-black/5 border-black/5 text-gray-900 placeholder:text-gray-400 focus:ring-gray-900/20', searchIcon: 'text-gray-400', chipOn: 'bg-gray-900 text-white', chipOff: 'bg-white/60 border-black/5 text-gray-600 hover:bg-black/5', filterBar: 'bg-black/5', time: 'text-gray-400', unread: 'bg-green-500 text-white', readDot: 'bg-black/5' };

export const NotificationsN2ListPanel: React.FC<NotificationsN2ListPanelProps> = ({ onSelectNotification, selectedId = null, isShellDark = false }) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const s = shell(isShellDark);

  const filtered = useMemo(() => {
    let result = DEMO_NOTIFICATIONS;
    if (categoryFilter !== 'all') result = result.filter((n) => n.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    return result;
  }, [categoryFilter, searchQuery]);

  const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${s.root}`}>
      {/* Header N2 */}
      <div className={`flex items-center justify-between p-4 flex-shrink-0 transition-colors duration-500 ${s.header}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
            <Bell size={16} />
          </span>
          <div className="min-w-0">
            <h2 className={`text-base font-semibold leading-tight truncate ${s.text}`}>Notificaciones</h2>
            <p className={`text-[10px] leading-tight truncate ${s.sub}`}>{DEMO_NOTIFICATIONS.length} alertas · {unreadCount} sin leer</p>
          </div>
        </div>
        <div className="relative flex-shrink-0 w-32">
          <Search size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${s.searchIcon}`} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className={`w-full h-8 rounded-lg pl-8 pr-2 text-xs outline-none transition-colors ${s.search}`} />
        </div>
      </div>

      {/* Filtro por categoría */}
      <div className={`flex items-center gap-2 p-3 flex-shrink-0 overflow-x-auto hide-scrollbar transition-colors duration-500 ${s.filterBar}`}>
        {CATEGORY_FILTERS.map((filter) => {
          const isActive = categoryFilter === filter.id;
          return (
            <button key={filter.id} type="button" onClick={() => setCategoryFilter(filter.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${isActive ? s.chipOn : s.chipOff}`}>
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Lista de notificaciones */}
      <div className={`flex-1 overflow-y-auto flex flex-col ${s.list}`}>
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <Bell size={32} className={`${s.empty} mb-3`} />
            <p className={`text-sm font-medium ${s.emptyText}`}>No hay notificaciones</p>
            <p className={`text-xs mt-1 ${s.emptyHint}`}>Ajusta el filtro o la búsqueda</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const isSelected = notif.id === selectedId;
            const meta = CATEGORY_META[notif.category];
            return (
              <button key={notif.id} type="button" onClick={() => onSelectNotification(notif.id)} className={`w-full flex items-center gap-3 p-4 text-left transition-colors active:scale-[0.99] ${isSelected ? s.selected : s.card}`}>
                <span className="relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: `${meta.color}15`, borderColor: `${meta.color}30`, color: meta.color }}>
                  {meta.icon}
                  {!notif.read && <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isShellDark ? 'bg-fuchsia-500' : 'bg-green-500'} ring-2 ${isShellDark ? 'ring-white/10' : 'ring-white/70'}`} />}
                </span>
                <span className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className={`font-semibold text-sm truncate ${s.text}`}>{notif.title}</span>
                  <span className={`text-[11px] truncate mt-0.5 ${s.sub}`}>{notif.message}</span>
                  <span className={`text-[10px] mt-0.5 ${s.time}`}>{notif.time}</span>
                </span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  {!notif.read && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${s.unread}`}>NUEVO</span>}
                  <ChevronRight size={16} className={s.chevron} />
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsN2ListPanel;