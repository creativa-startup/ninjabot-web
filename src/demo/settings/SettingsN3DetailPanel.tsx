/**
 * @module SettingsN3DetailPanel
 * @description Panel central N3 — Módulo Configuraciones del Perfil del Creador.
 * Actúa como contenedor dinámico: recibe la prop `activeView` y renderiza la
 * sub-vista seleccionada según la lógica de sub-módulos:
 *
 *   - `store`:  Pestañas locales Productos (grilla responsiva con tarjeta "+" +
 *               ProductCard mapeando el array) y Pedidos (historial de compras).
 *   - `tickets`: Pestañas Comprados (tarjetas con QR estético simulado + botón
 *               "Traspasar/Regalar") y Vendidos (historial de traspasos).
 *   - `account` / `integrations`: Esqueleto de edición de perfil / conexiones Meta.
 *   - `ninjabot` / `dashboard`: Esqueletos visuales de asistente IA y métricas.
 *   - `ui_ux`:    Delega al módulo desacoplado `src/demo/uiux/UiUxView`
 *               (SRP — Estudio Global + Inspector de Componentes).
 *
 * Layout Decoupling: componente puro — recibe estado y callbacks por props.
 * Estética Premium UX/UI Card: fondos translúcidos con blur, bordes invisibles
 * (border-black/5 claro / border-white/10 oscuro), sin sombras pesadas.
 */

import React, { useState } from 'react';
import { ChevronLeft, Plus, ShoppingBag, Ticket, User, Plug, Zap, LayoutDashboard, Camera, ThumbsUp, MessageCircle, ArrowLeftRight, CheckCircle2, Package, Boxes, QrCode, BadgeCheck, Pencil, Mail, Phone, Palette } from 'lucide-react';
import { ProductCard } from '../../components/ui/ProductCard';
import { UiUxView } from '../uiux/UiUxView';
import { Avatar } from '../../components/ui/Avatar';
import type { DemoProduct, DemoOrder, DemoTicket, DemoSoldTicket, DemoMetaConnection, SettingsView } from './mockSettings';
import { DEMO_ORDERS, DEMO_BOUGHT_TICKETS, DEMO_SOLD_TICKETS, DEMO_META_CONNECTIONS, SETTINGS_MODULES } from './mockSettings';

export interface SettingsN3DetailPanelProps {
  /** Vista activa del módulo Configuración (sub-módulo a renderizar) */
  activeView: SettingsView;
  /** Callback "atrás" — usado por el LayoutDemo para volver a N2 (móvil) */
  onBackClick?: () => void;
  /** Callback para abrir el formulario de creación de producto (N4 overlay) */
  onOpenCreateProduct?: () => void;
  /** Lista de productos del catálogo (inyectada por el orquestador) */
  products?: DemoProduct[];
  /** Tema del shell maestro (dark/light) para adaptar colores base */
  isShellDark?: boolean;
}

const shell = (dark: boolean) =>
  dark
    ? {
        root: 'bg-transparent text-white',
        header: 'bg-transparent border-white/10',
        card: 'glass-card-dark',
        text: 'text-white',
        sub: 'text-gray-500',
        title: 'text-gray-300',
        back: 'text-gray-400 hover:bg-white/10 hover:text-white',
        badge: 'bg-white/5 border-white/10 text-fuchsia-300',
        chipOn: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
        chipOff: 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white',
        input: 'bg-transparent border-white/10 text-white placeholder:text-gray-500',
        toggleOn: 'bg-fuchsia-500',
        toggleOff: 'bg-white/10',
        empty: 'text-gray-700',
        emptyText: 'text-gray-400',
        emptyHint: 'text-gray-600',
        accent: 'text-fuchsia-400',
      }
    : {
        root: 'bg-transparent text-gray-900',
        header: 'bg-white/80 backdrop-blur-md border-black/5',
        card: 'bg-white/80 backdrop-blur-md border-black/5',
        text: 'text-gray-900',
        sub: 'text-gray-500',
        title: 'text-gray-700',
        back: 'text-gray-500 hover:bg-black/5 hover:text-gray-700',
        badge: 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700',
        chipOn: 'bg-gray-900 text-white border-gray-900',
        chipOff: 'bg-white/60 border-black/5 text-gray-600 hover:bg-black/5',
        input: 'bg-black/5 border-black/5 text-gray-900 placeholder:text-gray-400',
        toggleOn: 'bg-gray-900',
        toggleOff: 'bg-black/10',
        empty: 'text-gray-300',
        emptyText: 'text-gray-500',
        emptyHint: 'text-gray-400',
        accent: 'text-fuchsia-600',
      };

/* ═══ Sub-vista: Tienda (Productos + Pedidos) ═══ */
const StoreView: React.FC<{
  s: ReturnType<typeof shell>;
  products: DemoProduct[];
  isDark: boolean;
  onOpenCreateProduct: () => void;
}> = ({ s, products, isDark, onOpenCreateProduct }) => {
  const [tab, setTab] = useState<'products' | 'orders'>('products');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        {/* ─── Pestañas locales: Productos | Pedidos ─── */}
        <div className={`inline-flex rounded-xl p-1 border transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
          <button
            type="button"
            onClick={() => setTab('products')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'products' ? s.chipOn : s.chipOff}`}
          >
            <Boxes size={13} />
            Productos · {products.length}
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'orders' ? s.chipOn : s.chipOff}`}
          >
            <Package size={13} />
            Pedidos · {DEMO_ORDERS.length}
          </button>
        </div>

        {tab === 'products' ? (
          /* ─── Grilla responsiva: tarjeta "+" primero + ProductCard ─── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Tarjeta "+" para agregar producto */}
            <button
              type="button"
              onClick={onOpenCreateProduct}
              title="Agregar producto"
              className="group aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] hover:border-[#e056fd]/30 cursor-pointer"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)',
              }}
            >
              <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-white/10 text-fuchsia-400' : 'bg-fuchsia-500/10 text-fuchsia-600'}`}>
                <Plus size={20} strokeWidth={2} />
              </span>
              <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Agregar producto
              </span>
            </button>

            {/* ProductCard mapeando el array de productos */}
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isDark={isDark}
                onAddToCart={(id) => {
                  console.log('[Settings Tienda] Producto agregado al carrito:', id);
                }}
              />
            ))}
          </div>
        ) : (
          /* ─── Pedidos: listado simple con historial de compras ─── */
          <div className="flex flex-col gap-3">
            <h4 className={`text-[11px] font-bold uppercase tracking-wide ${s.sub}`}>
              Historial de pedidos
            </h4>
            {DEMO_ORDERS.map((order: DemoOrder) => (
              <div key={order.id} className={`rounded-2xl p-4 border transition-colors duration-500 ${s.card}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${s.text}`}>{order.product}</p>
                    <p className={`text-xs mt-0.5 truncate ${s.sub}`}>
                      {order.customer} · {order.date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`font-semibold text-sm ${s.text}`}>{order.total}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        order.status === 'Completado'
                          ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-700'
                          : order.status === 'Cancelado'
                            ? isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-500/10 border-rose-500/10 text-rose-700'
                            : isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-500/10 border-amber-500/10 text-amber-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <p className={`text-[10px] mt-2 font-mono ${s.sub}`}>#{order.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══ Sub-vista: Tickets (Comprados + Vendidos) ═══ */
const TicketsView: React.FC<{
  s: ReturnType<typeof shell>;
  isDark: boolean;
}> = ({ s, isDark }) => {
  const [tab, setTab] = useState<'bought' | 'sold'>('bought');

  /* QR simulado estáticamente: cuadrícula offset pseudo-aleatoria determinística */
  const QR_CELLS = [
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0],
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        {/* ─── Pestañas locales: Comprados | Vendidos ─── */}
        <div className={`inline-flex rounded-xl p-1 border transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
          <button
            type="button"
            onClick={() => setTab('bought')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'bought' ? s.chipOn : s.chipOff}`}
          >
            <Ticket size={13} />
            Comprados · {DEMO_BOUGHT_TICKETS.length}
          </button>
          <button
            type="button"
            onClick={() => setTab('sold')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'sold' ? s.chipOn : s.chipOff}`}
          >
            <ArrowLeftRight size={13} />
            Vendidos · {DEMO_SOLD_TICKETS.length}
          </button>
        </div>

        {tab === 'bought' ? (
          /* ─── Comprados: tarjetas con QR simulado + botón Traspasar ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_BOUGHT_TICKETS.map((ticket: DemoTicket) => (
              <div key={ticket.id} className={`rounded-2xl p-4 border transition-colors duration-500 ${s.card}`}>
                {/* Encabezado del boleto */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm leading-tight ${s.text}`}>{ticket.event}</p>
                    <p className={`text-[11px] mt-1 ${s.sub}`}>{ticket.date}</p>
                    <p className={`text-[11px] mt-0.5 ${s.sub}`}>{ticket.location}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${s.badge}`}>
                    <BadgeCheck size={11} />
                    Válido
                  </span>
                </div>

                {/* Código + QR simulado */}
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-lg p-1.5 border flex-shrink-0 grid grid-cols-6 gap-[2px] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}
                    aria-label={`Código QR del boleto ${ticket.code}`}
                  >
                    {Array.from({ length: 36 }).map((_, i) => {
                      const row = Math.floor(i / 6);
                      const col = i % 6;
                      const filled = row < QR_CELLS.length ? QR_CELLS[row][col + (row % 3)] : (i * 7) % 3 === 0;
                      return (
                        <span
                          key={i}
                          className={`rounded-[1px] ${filled ? (isDark ? 'bg-fuchsia-400/70' : 'bg-fuchsia-600/70') : 'bg-transparent'}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${s.sub}`}>Código</p>
                    <p className={`font-mono text-xs font-semibold truncate ${s.text}`}>{ticket.code}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                      <QrCode size={11} />
                      Presenta este código en el ingreso
                    </p>
                  </div>
                </div>

                {/* Acción: Traspasar / Regalar */}
                <button
                  type="button"
                  className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                    isDark
                      ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30'
                      : 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700 hover:bg-fuchsia-500/20'
                  }`}
                >
                  <ArrowLeftRight size={13} />
                  Traspasar / Regalar
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ─── Vendidos: historial de traspasos ─── */
          <div className="flex flex-col gap-3">
            <h4 className={`text-[11px] font-bold uppercase tracking-wide ${s.sub}`}>
              Historial de traspasos
            </h4>
            {DEMO_SOLD_TICKETS.map((sold: DemoSoldTicket) => (
              <div key={sold.id} className={`rounded-2xl p-4 border transition-colors duration-500 ${s.card}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${s.text}`}>{sold.event}</p>
                    <p className={`text-xs mt-0.5 truncate ${s.sub}`}>
                      {sold.date} · Transferido a {sold.transferredTo}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`font-semibold text-sm ${s.text}`}>{sold.price}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-700'
                    }`}>
                      <CheckCircle2 size={10} />
                      Completado
                    </span>
                  </div>
                </div>
                <p className={`text-[10px] mt-2 font-mono ${s.sub}`}>#{sold.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══ Sub-vista: Cuenta (vista solo texto sin fondo + formulario inmersivo) ═══ */
const AccountView: React.FC<{
  s: ReturnType<typeof shell>;
  isDark: boolean;
}> = ({ s, isDark }) => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Mi Negocio',
    username: 'mi_negocio',
    bio: 'Creando contenido que conecta marcas con personas. Automatización con IA + storytelling directo. 🚀',
    email: 'contacto@minegocio.com',
    phone: '+593 99 123 4567',
  });
  const [draft, setDraft] = useState(profile);

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  /* ─── Formulario inmersivo (modo edición, sin fondo — sobre el background) ─── */
  if (editing) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5 flex flex-col gap-5 w-full">
          <h4 className={`text-[11px] font-bold uppercase tracking-wide ${s.sub}`}>Editar perfil</h4>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium ${s.title}`}>Nombre</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={`h-10 rounded-xl px-3.5 text-sm outline-none transition-colors ${s.input}`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium ${s.title}`}>Usuario</label>
              <input
                type="text"
                value={draft.username}
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                className={`h-10 rounded-xl px-3.5 text-sm outline-none transition-colors ${s.input}`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium ${s.title}`}>Descripción</label>
              <textarea
                rows={3}
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className={`rounded-xl px-3.5 py-3 text-sm outline-none resize-none transition-colors ${s.input}`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium ${s.title}`}>Correo</label>
                <div className="relative">
                  <Mail size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className={`h-10 rounded-xl pl-10 pr-3.5 text-sm outline-none transition-colors w-full ${s.input}`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-medium ${s.title}`}>Teléfono</label>
                <div className="relative">
                  <Phone size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    className={`h-10 rounded-xl pl-10 pr-3.5 text-sm outline-none transition-colors w-full ${s.input}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={handleSave} className={`flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              isDark ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30' : 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700 hover:bg-fuchsia-500/20'
            }`}>
              Guardar cambios
            </button>
            <button type="button" onClick={handleCancel} className={`flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white/60 border-black/5 text-gray-700 hover:bg-black/5'
            }`}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Vista de solo texto (modo lectura, sin tarjeta — sobre el background) ─── */
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-5 flex flex-col gap-5 w-full">
        {/* Avatar + nombre + usuario + verificado */}
        <div className="flex items-start gap-4">
          <Avatar
            fallback={profile.name
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
            size="lg"
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-base leading-tight ${s.text}`}>{profile.name}</p>
            <p className={`text-xs mt-0.5 ${s.sub}`}>@{profile.username}</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${s.badge}`}>
            <BadgeCheck size={12} />
            Verificado
          </span>
        </div>

        {/* Descripción — directamente sobre el fondo */}
        <p className={`text-sm leading-relaxed ${s.sub}`}>{profile.bio}</p>

        {/* Botón estilo link: Editar perfil — alineado a la izquierda */}
        <button
          type="button"
          onClick={() => {
            setDraft(profile);
            setEditing(true);
          }}
          className="flex items-center justify-start gap-1.5 py-2 text-xs font-semibold transition-colors cursor-pointer group self-start"
        >
          <Pencil size={13} className={`transition-transform group-hover:-rotate-12 ${isDark ? 'text-fuchsia-400' : 'text-fuchsia-600'}`} />
          <span className={`underline underline-offset-4 ${isDark ? 'text-fuchsia-400 hover:text-fuchsia-300' : 'text-fuchsia-600 hover:text-fuchsia-700'}`}>
            Editar perfil
          </span>
        </button>
      </div>
    </div>
  );
};

/* ═══ Sub-vista: Integraciones (conexiones Meta) ═══ */
const IntegrationsView: React.FC<{
  s: ReturnType<typeof shell>;
  isDark: boolean;
}> = ({ s, isDark }) => {
  const [connections, setConnections] = useState<DemoMetaConnection[]>(DEMO_META_CONNECTIONS);

  const toggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, connected: !conn.connected } : conn))
    );
  };

  const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    instagram: <Camera size={17} strokeWidth={1.5} />,
    facebook: <ThumbsUp size={17} strokeWidth={1.5} />,
    commerce: <ShoppingBag size={17} strokeWidth={1.5} />,
    whatsapp: <MessageCircle size={17} strokeWidth={1.5} />,
  };

  const PLATFORM_COLORS: Record<string, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    commerce: '#F59E0B',
    whatsapp: '#25D366',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        <h4 className={`text-[11px] font-bold uppercase tracking-wide ${s.sub}`}>
          Conexiones Meta · {connections.filter((c) => c.connected).length}/{connections.length} activas
        </h4>

        {connections.map((conn: DemoMetaConnection) => {
          const color = PLATFORM_COLORS[conn.platform] ?? '#8B5CF6';
          return (
            <div key={conn.id} className={`rounded-2xl p-4 border transition-colors duration-500 ${s.card}`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border`} style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, color }}>
                  {PLATFORM_ICONS[conn.platform] ?? <Plug size={17} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${s.text}`}>{conn.label}</p>
                  <p className={`text-xs mt-0.5 truncate ${s.sub}`}>{conn.detail}</p>
                </div>
                {/* Toggle conectar/desconectar */}
                <button
                  type="button"
                  onClick={() => toggleConnection(conn.id)}
                  title={conn.connected ? 'Desconectar' : 'Conectar'}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300 flex-shrink-0 ${
                    conn.connected ? (isDark ? 'bg-fuchsia-500' : 'bg-fuchsia-600') : (isDark ? 'bg-white/10' : 'bg-black/10')
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      conn.connected ? 'translate-x-[20px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══ Sub-vista: Ninjabot (asistente IA) ═══ */
const NinjabotView: React.FC<{
  s: ReturnType<typeof shell>;
  isDark: boolean;
}> = ({ s, isDark }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        <div className={`rounded-2xl p-5 border transition-colors duration-500 ${s.card}`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-4 ${s.sub}`}>Asistente IA</h4>
          <div className="flex flex-col gap-4">
            {/* Activar/desactivar Ninjabot */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`font-medium text-sm ${s.text}`}>Ninjabot activo</p>
                <p className={`text-xs mt-0.5 ${s.sub}`}>Responde automáticamente a tus chats de venta 24/7</p>
              </div>
              <span className={`w-11 h-6 rounded-full flex items-center px-0.5 ${isDark ? 'bg-fuchsia-500' : 'bg-fuchsia-600'}`}>
                <span className="w-5 h-5 rounded-full bg-white shadow-sm translate-x-[20px] transition-transform" />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`font-medium text-sm ${s.text}`}>Agente Vendedor</p>
                <p className={`text-xs mt-0.5 ${s.sub}`}>Prioriza respuestas de venta y cierre</p>
              </div>
              <span className={`w-11 h-6 rounded-full flex items-center px-0.5 ${isDark ? 'bg-fuchsia-500' : 'bg-fuchsia-600'}`}>
                <span className="w-5 h-5 rounded-full bg-white shadow-sm translate-x-[20px] transition-transform" />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`font-medium text-sm ${s.text}`}>Agente Apuntador</p>
                <p className={`text-xs mt-0.5 ${s.sub}`}>Toma notas y resume conversaciones</p>
              </div>
              <span className={`w-11 h-6 rounded-full flex items-center px-0.5 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                <span className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform" />
              </span>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 border transition-colors duration-500 ${s.card}`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-3 ${s.sub}`}>Tono de respuesta</h4>
          <div className="grid grid-cols-3 gap-2">
            {['Profesional', 'Amigable', 'Casual'].map((tone) => (
              <button key={tone} type="button" className={`rounded-xl py-2.5 text-xs font-medium border transition-colors ${
                tone === 'Amigable'
                  ? isDark ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300' : 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700'
                  : isDark ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' : 'bg-white/60 border-black/5 text-gray-600 hover:bg-black/5'
              }`}>
                {tone}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══ Sub-vista: Dashboard (métricas) ═══ */
const DashboardView: React.FC<{
  s: ReturnType<typeof shell>;
  isDark: boolean;
}> = ({ s, isDark }) => {
  const stats = [
    { label: 'Ventas totales', value: '$2.4K', delta: '+12%' },
    { label: 'Productos activos', value: '6', delta: '+2' },
    { label: 'Pedidos del mes', value: '28', delta: '+8%' },
    { label: 'Tickets vendidos', value: '3', delta: '+1' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        <h4 className={`text-[11px] font-bold uppercase tracking-wide ${s.sub}`}>Resumen del negocio</h4>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`rounded-2xl p-4 border transition-colors duration-500 ${s.card}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${s.sub}`}>{stat.label}</p>
              <p className={`text-xl font-semibold mt-1.5 ${s.text}`}>{stat.value}</p>
              <p className={`text-[11px] font-medium mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stat.delta}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl p-5 border transition-colors duration-500 ${s.card}`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-4 ${s.sub}`}>Canales con más ventas</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Instagram', pct: 45, color: '#E4405F' },
              { label: 'WhatsApp', pct: 35, color: '#25D366' },
              { label: 'Facebook', pct: 20, color: '#1877F2' },
            ].map((chan) => (
              <div key={chan.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${s.text}`}>{chan.label}</span>
                  <span className={s.sub}>{chan.pct}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                  <div className="h-full rounded-full" style={{ width: `${chan.pct}%`, backgroundColor: chan.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══ Sub-vista: Apariencia (delega al módulo desacoplado src/demo/uiux/) ═══ */
const UiUxViewAdapter: React.FC<{
  isDark: boolean;
}> = ({ isDark }) => {
  return <UiUxView isDark={isDark} isAdmin />;
};

/* ═══ Componente principal: contenedor dinámico según activeView ═══ */
export const SettingsN3DetailPanel: React.FC<SettingsN3DetailPanelProps> = ({
  activeView,
  onBackClick,
  onOpenCreateProduct,
  products = [],
  isShellDark = false,
}) => {
  const s = shell(isShellDark);
  const moduleMeta = SETTINGS_MODULES.find((m) => m.id === activeView) ?? SETTINGS_MODULES[0];

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${s.root}`}>
      {/* ─── Cabecera N3 ─── */}
      <div className={`flex items-center gap-3 p-4 border-b flex-shrink-0 transition-colors duration-500 ${s.header}`}>
        <button type="button" onClick={onBackClick} title="Volver a la configuración" className={`md:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${s.back}`}>
          <ChevronLeft size={18} />
        </button>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${isShellDark ? 'bg-white/10 border-white/10 text-fuchsia-400' : 'bg-fuchsia-500/10 border-fuchsia-500/10 text-fuchsia-700'}`}>
          {activeView === 'account' ? <User size={17} /> : activeView === 'integrations' ? <Plug size={17} /> : activeView === 'store' ? <ShoppingBag size={17} /> : activeView === 'tickets' ? <Ticket size={17} /> : activeView === 'ninjabot' ? <Zap size={17} /> : activeView === 'ui_ux' ? <Palette size={17} /> : <LayoutDashboard size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-sm truncate ${s.text}`}>{moduleMeta.label}</p>
          <p className={`text-xs truncate ${s.sub}`}>{moduleMeta.description}</p>
        </div>
        {moduleMeta.badge !== undefined && moduleMeta.badge > 0 && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${s.badge}`}>
            {moduleMeta.badge} pendientes
          </span>
        )}
      </div>

      {/* ─── Cuerpo N3: sub-vista según activeView ─── */}
      {activeView === 'store' && (
        <StoreView
          s={s}
          products={products}
          isDark={isShellDark}
          onOpenCreateProduct={onOpenCreateProduct ?? (() => {})}
        />
      )}
      {activeView === 'tickets' && <TicketsView s={s} isDark={isShellDark} />}
      {activeView === 'account' && <AccountView s={s} isDark={isShellDark} />}
      {activeView === 'integrations' && <IntegrationsView s={s} isDark={isShellDark} />}
      {activeView === 'ninjabot' && <NinjabotView s={s} isDark={isShellDark} />}
      {activeView === 'dashboard' && <DashboardView s={s} isDark={isShellDark} />}
      {activeView === 'ui_ux' && <UiUxViewAdapter isDark={isShellDark} />}
    </div>
  );
};

export default SettingsN3DetailPanel;