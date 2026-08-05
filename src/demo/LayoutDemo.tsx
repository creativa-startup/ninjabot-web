/**
 * @module LayoutDemo
 * @description Prototipo estructural (Wireframe en código) del Layout N1–N4.
 * Utiliza "cajas grises" (Tailwind CSS) para validar navegación, anchos y
 * estrategia responsive (1 vs 2 interacciones) SIN conectar lógica de negocio.
 *
 * Navegación de prueba:
 * - Móvil: N2 (list) → clic item → N3 (detail) → "[ Abrir Panel N4 ]" → N4 (context)
 * - Desktop: N2 + N3 visibles simultáneamente; N4 overlay cubre N3.
 *
 * Estética Premium UX/UI Card:
 * - Materialidad Flotante: fondos translúcidos con blur, bordes invisibles
 *   (border-black/5 claro / border-white/10 oscuro) y sombras ambientales.
 * - Regla estricta: NO sombras pesadas (shadow-md/lg/xl/2xl) ni bordes sólidos.
 *
 * Layout Decoupling:
 * El código inline de Chats/FeedNinja fue encapsulado en los paneles
 * ChatDemoN2ListPanel y ChatDemoN3DetailPanel (src/demo/chats/), que cumplen
 * la taxonomía [Domain]N[Level][Type]Panel. Este orquestador solo mantiene
 * el estado del shell y delega datos/callbacks por props.
 *
 * Shell Refactor (Sandbox):
 * - GlobalHeader: zona izquierda con icono Zap + "Ninjazs" (font-medium);
 *   zona derecha con toggle Sun/Moon y Avatar de perfil (abre módulo profiles).
 * - Sidebar N1: navegación global limpia — solo Chats + Modo Ninja (Zap) +
 *   "Cerrar Sesión" fijado al fondo con mt-auto.
 *
 * Enrutamiento Anidado (Wrapper del Perfil):
 * - El ControlProfile actúa como header maestro PERSISTENTE del módulo Perfil
 *   (título a la izquierda, íconos a la derecha). Navega entre Timeline,
 *   Contactos y Configuración SIN salir del contexto del Perfil (profileView).
 * - Contactos y Configuración ya NO viven en el Sidebar N1: su acceso se oculta
 *   del navegador global y se dispara desde los íconos del ControlProfile.
 * - El botón "+" del header maestro dispara el ControlCreatePost interno del
 *   Timeline mediante un token (createPostToken) — sin acoplar el orquestador.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { MessageSquare, Moon, Bell, LogOut, Search, X, Sun, Zap } from 'lucide-react';
import { NinjabotLogo } from '../components/common/NinjabotLogo';
import { Avatar } from '../components/ui/Avatar';
import { ContactsN2List } from './contacts/ContactsN2List';
import { ContactsN3Detail } from './contacts/ContactsN3Detail';
import { ProfilesN2ListPanel } from './profiles/ProfilesN2ListPanel';
import { ProfilesN3DetailPanel } from './profiles/ProfilesN3DetailPanel';
import { SettingsN2ListPanel } from './settings/SettingsN2ListPanel';
import { SettingsN3DetailPanel } from './settings/SettingsN3DetailPanel';
import { CatalogN4CreateProductForm } from './shop/CatalogN4CreateProductForm';
import type { SettingsView } from './settings/mockSettings';
import { DEMO_STORE_PRODUCTS } from './settings/mockSettings';
import type { DemoProduct } from './settings/mockSettings';
import { NotificationsN2ListPanel } from './notifications/NotificationsN2ListPanel';
import { NotificationsN3DetailPanel } from './notifications/NotificationsN3DetailPanel';
import { ChatDemoN2ListPanel } from './chats/ChatDemoN2ListPanel';
import { ChatDemoN3DetailPanel } from './chats/ChatDemoN3DetailPanel';
import { ControlProfile, type ProfileView } from './profiles/ControlProfile';

type MobileView = 'list' | 'detail' | 'context';

/** Dominios exactos de módulos activos (semántica estricta Beta) */
type ActiveModule = 'chats' | 'profiles' | 'notifications';

/** Config taxonómica del Sidebar N1 — solo módulos globales de primer nivel */
const MODULE_NAV_ITEMS: Array<{
  id: ActiveModule;
  label: string;
  icon: ReactNode;
}> = [
  { id: 'chats', label: 'Chats', icon: <MessageSquare size={19} /> },
];

export const LayoutDemo = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('chats');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isN4Open, setIsN4Open] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [isNoteBubbleOpen, setIsNoteBubbleOpen] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [justSavedNote, setJustSavedNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [demoNotes, setDemoNotes] = useState<Array<{ id: string; date: string; text: string }>>([
    { id: 'n1', date: '8 Ene 2026 · 4:20 PM', text: 'Recordar hacer seguimiento del pedido #1024 con María Fernanda.' },
    { id: 'n2', date: '7 Ene 2026 · 10:05 AM', text: 'Cliente interesado en el plan premium, agendar demo el viernes.' },
    { id: 'n3', date: '6 Ene 2026 · 3:47 PM', text: 'Enviar catálogo actualizado con precios de Meta Ads Esencial.' },
  ]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [feedNinjaActive, setFeedNinjaActive] = useState(false);
  const [isShellDark, setIsShellDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStory, setActiveStory] = useState<boolean>(false);

  /* ─── Wrapper del Perfil: vista activa del submódulo (Timeline/Contactos/Config) ─── */
  const [profileView, setProfileView] = useState<ProfileView>('timeline');

  /* ─── Configuraciones del Perfil: sub-vista activa (Cuenta/Integraciones/Store/Tickets/Ninjabot/Dashboard) ─── */
  const [settingsView, setSettingsView] = useState<SettingsView>('account');

  /* ─── Catálogo Tienda: productos demo + overlay N4 de creación ─── */
  const [storeProducts, setStoreProducts] = useState<DemoProduct[]>(DEMO_STORE_PRODUCTS);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  /** Guarda un producto nuevo en el catálogo y cierra el overlay N4 */
  const handleSaveProduct = (product: DemoProduct) => {
    setStoreProducts((prev) => [product, ...prev]);
    setIsCreateProductOpen(false);
  };

  /* ─── Token del "+" maestro — incrementa para abrir el ControlCreatePost interno del Timeline ─── */
  const [createPostToken, setCreatePostToken] = useState(0);

  /* ─── Token de cierre defensivo — se incrementa al cambiar de vista para cerrar el editor ─── */
  const [closeCreatePostToken, setCloseCreatePostToken] = useState(0);

  /** Cambia la vista del Perfil y cierra el editor de creación de post (defensivo) */
  const handleProfileViewChange = (view: ProfileView) => {
    setProfileView(view);
    setCloseCreatePostToken((t) => t + 1);
    /* Cierra el overlay N4 de creación de producto al salir de Configuración */
    setIsCreateProductOpen(false);
  };

  /** Handler genérico de navegación por módulo (semántica estricta Beta) */
  const handleModuleClick = (module: ActiveModule) => {
    setActiveModule(module);
    setFeedNinjaActive(false);
    setIsN4Open(false);
    setIsNoteBubbleOpen(false);
    setIsSavingNote(false);
    setActiveStory(false);
    setMobileView('list');
    /* Reset del enrutamiento anidado del Perfil al salir a otro módulo global */
    setProfileView('timeline');
    /* Cierre defensivo del overlay N4 de creación de producto */
    setIsCreateProductOpen(false);
  };

  /** Alterna el Modo Ninja — módulo global de primer nivel en el Sidebar N1 */
  const handleToggleNinjaMode = () => {
    if (!feedNinjaActive) {
      setActiveModule('chats');
      setFeedNinjaActive(true);
    } else {
      setFeedNinjaActive(false);
    }
    setIsN4Open(false);
    setIsNoteBubbleOpen(false);
    setIsSavingNote(false);
    setActiveStory(false);
    setMobileView('list');
    /* Reset del enrutamiento anidado del Perfil al salir al Modo Ninja */
    setProfileView('timeline');
    /* Cierre defensivo del overlay N4 de creación de producto */
    setIsCreateProductOpen(false);
  };

  const handleItemClick = (id: string) => {
    setSelectedId(id);
    setIsEmpty(false);
    setIsNoteBubbleOpen(false);
    setMobileView('detail');
  };

  const handleOpenN4History = () => {
    setIsNoteBubbleOpen(false);
    setIsN4Open(true);
    setMobileView('context');
  };

  const handleCloseN4 = () => {
    setIsN4Open(false);
    setMobileView('detail');
  };

  const handleSaveNote = () => {
    if (!noteDraft.trim()) return;
    setIsSavingNote(true);
    window.setTimeout(() => {
      const now = new Date();
      const dateStr = now
        .toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
        .replace('.', '');
      const timeStr = now.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });
      const newNote = {
        id: `demo-note-${Date.now()}`,
        date: `${dateStr} · ${timeStr}`,
        text: noteDraft.trim(),
      };
      setDemoNotes((prev) => [newNote, ...prev]);
      setNoteDraft('');
      setIsSavingNote(false);
      setIsNoteBubbleOpen(false);
      setIsN4Open(true);
      setMobileView('context');
      setJustSavedNote(true);
      window.setTimeout(() => setJustSavedNote(false), 2000);
    }, 900);
  };

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 ${
        isShellDark ? 'bg-transparent' : 'bg-neutral-50/50'
      }`}
    >
      {/* ═══ 1. GlobalHeader (Top) — branding Ninjazs + toggle Shell Dark aislado ═══ */}
      <header
        className={`w-full sticky top-0 z-20 flex-shrink-0 flex flex-col panel-header-clean transition-colors duration-500 ${
          activeStory ? 'hidden md:flex' : ''
        } ${isShellDark ? 'text-white' : 'text-gray-900'}`}
        style={isShellDark ? { backgroundColor: 'var(--panel-header)', boxShadow: 'var(--shadow-panel-top)' } : undefined}
      >
        {/* Fila principal: logo + buscador + acciones */}
        <div className="h-14 flex items-center justify-between px-3 sm:px-4">
          {/* Izquierda: logo oficial Ninjabot (igual a producción) + branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <NinjabotLogo variant="color" size="md" className="shrink-0" />
            <div className="min-w-0">
              <h1 className={`font-medium text-sm sm:text-base tracking-wide leading-tight truncate ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
                Ninjazs
              </h1>
            </div>
          </div>

          {/* Derecha: buscador usuarios (desktop) + lupa (móvil) + toggle Sun/Moon + notificación + avatar perfil */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Buscador desktop: input siempre visible al lado de la luna */}
            <div className="hidden md:block relative">
              <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuarios..."
                className={`w-40 lg:w-56 h-9 rounded-xl pl-9 pr-3 text-sm outline-none transition-all duration-300 ${
                  isShellDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-fuchsia-500/50 hover:border-white/20'
                    : 'bg-black/5 border border-black/5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-fuchsia-500/30 hover:border-black/10'
                }`}
              />
            </div>

            {/* Lupa móvil: despliega la búsqueda a ancho completo */}
            <button
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              title="Buscar usuarios"
              className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isSearchOpen
                  ? isShellDark
                    ? 'text-fuchsia-400 bg-white/15'
                    : 'text-fuchsia-600 bg-fuchsia-500/10'
                  : isShellDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
              }`}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* Toggle de tema: Sun en modo oscuro, Moon en modo claro */}
            <button
              type="button"
              onClick={() => setIsShellDark((prev) => !prev)}
              title={isShellDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isShellDark ? 'text-fuchsia-400 bg-white/10 hover:bg-white/20' : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
              }`}
            >
              {isShellDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>

            <button
              type="button"
              onClick={() => handleModuleClick('notifications')}
              title="Notificaciones"
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeModule === 'notifications'
                  ? isShellDark
                    ? 'text-fuchsia-400 bg-white/15'
                    : 'text-fuchsia-600 bg-fuchsia-500/10'
                  : isShellDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
              }`}
            >
              <Bell size={18} strokeWidth={1.5} />
              <span className={`absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 text-[9px] font-bold rounded-full flex items-center justify-center text-white leading-none bg-fuchsia-500 border-2 ${isShellDark ? 'border-black/70' : 'border-white/70'}`}>
                3
              </span>
            </button>

            {/* Avatar del Perfil: componente Avatar (Capa 2) — abre el módulo profiles al hacer clic */}
            <button
              type="button"
              onClick={() => handleModuleClick('profiles')}
              title="Perfil"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                activeModule === 'profiles'
                  ? isShellDark
                    ? 'ring-2 ring-fuchsia-500/60 bg-white/10'
                    : 'ring-2 ring-fuchsia-500/30 bg-fuchsia-500/10'
                  : isShellDark
                    ? 'hover:bg-white/10'
                    : 'hover:bg-black/5'
              }`}
            >
              <Avatar fallback="JD" size="sm" className="border-0" />
            </button>
          </div>
        </div>

        {/* Fila de búsqueda móvil: input a ancho completo (expansible) */}
        {isSearchOpen && (
          <div className="md:hidden px-3 sm:px-4 pb-3 animate-slide-in-right">
            <div className="relative">
              <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                placeholder="Buscar usuarios..."
                className={`w-full h-9 rounded-xl pl-9 pr-9 text-sm outline-none transition-colors ${
                  isShellDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-fuchsia-500/50'
                    : 'bg-black/5 border border-black/5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-fuchsia-500/30'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ═══ 3. Zona Inferior (Sidebar + Paneles) — columna en móvil, fila en desktop ═══ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full">
        {/* ═══ 4. Sidebar N1 (Metamorfosis: barra horizontal en móvil, columna en desktop) ═══ */}
        <aside
          className={`w-full md:w-16 h-12 md:h-full flex flex-row md:flex-col items-center justify-between flex-shrink-0 z-10 overflow-x-auto hide-scrollbar panel-n1-clean transition-colors duration-500 ${
            activeStory ? 'hidden md:flex' : ''
          }`}
          style={isShellDark ? { backgroundColor: 'var(--panel-n1)' } : undefined}
        >
          {/* Navegación global (arriba en PC, izquierda en móvil) — solo Chats + Modo Ninja */}
          <div className="flex flex-row md:flex-col gap-1.5 md:gap-3 items-center justify-start px-2 md:px-0 md:py-4">
            {MODULE_NAV_ITEMS.map((moduleItem) => (
              <button
                key={moduleItem.id}
                type="button"
                onClick={() => handleModuleClick(moduleItem.id)}
                title={moduleItem.label}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  activeModule === moduleItem.id
                    ? isShellDark
                      ? 'text-white bg-white/15'
                      : 'text-brand bg-black/5 font-bold'
                    : isShellDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'
                }`}
              >
                {moduleItem.icon}
              </button>
            ))}

            {/* ─── Modo Ninja — módulo global de primer nivel (ícono Zap) ─── */}
            <button
              type="button"
              onClick={handleToggleNinjaMode}
              title="Modo Ninja"
              aria-pressed={activeModule === 'chats' && feedNinjaActive}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                activeModule === 'chats' && feedNinjaActive
                  ? isShellDark
                    ? 'text-fuchsia-400 bg-fuchsia-500/20 ring-1 ring-fuchsia-500/40'
                    : 'text-fuchsia-600 bg-fuchsia-500/10 ring-1 ring-fuchsia-500/30'
                  : isShellDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'
              }`}
            >
              <Zap size={19} strokeWidth={1.5} />
            </button>
          </div>

          {/* Cerrar sesión (abajo en PC con mt-auto, derecha en móvil) */}
          <div className="flex flex-row md:flex-col gap-1.5 md:gap-3 items-center px-2 md:px-0 md:py-4 mt-auto">
            <button
              type="button"
              title="Cerrar sesión"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isShellDark
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
              }`}
            >
              <LogOut size={19} strokeWidth={1.5} />
            </button>
          </div>
        </aside>

        {/* ═══ 5. Panel N2 (Lista — Feed Omnicanal / Perfil Anidado) ═══ */}
        <div
          className={`w-full md:w-[360px] lg:w-[400px] flex flex-col flex-shrink-0 relative panel-n2-clean transition-colors duration-500 ease-in-out ${
            feedNinjaActive ? 'bg-transparent text-white' : ''
          } ${mobileView === 'list' ? 'block' : 'hidden md:block'} ${activeStory ? 'flex-1 md:flex-none' : ''}`}
          style={isShellDark ? { backgroundColor: 'var(--panel-n2)' } : undefined}
        >
          {activeModule === 'chats' ? (
            <ChatDemoN2ListPanel
              isShellDark={isShellDark}
              feedNinjaActive={feedNinjaActive}
              activeStory={activeStory}
              onSelectChat={handleItemClick}
              onSetActiveStory={setActiveStory}
            />
          ) : activeModule === 'profiles' ? (
            <>
              {/* ─── Wrapper: Header maestro PERSISTENTE del Perfil (asimétrico) ─── */}
              <ControlProfile
                activeView={profileView}
                onChangeView={handleProfileViewChange}
                onOpenCreatePost={() => setCreatePostToken((t) => t + 1)}
                isShellDark={isShellDark}
              />

              {/* ─── Contenido N2 según la vista anidada del Perfil ─── */}
              {profileView === 'timeline' ? (
                <ProfilesN2ListPanel
                  selectedId={selectedId}
                  isShellDark={isShellDark}
                  createPostToken={createPostToken}
                  closeCreatePostToken={closeCreatePostToken}
                  onSelectProfile={(id) => {
                    setSelectedId(id);
                    setMobileView('detail');
                  }}
                />
              ) : profileView === 'contacts' ? (
                <ContactsN2List
                  selectedId={selectedId}
                  isShellDark={isShellDark}
                  onSelectContact={(id) => {
                    setSelectedId(id);
                    setMobileView('detail');
                  }}
                />
              ) : (
                <SettingsN2ListPanel
                  activeView={settingsView}
                  isShellDark={isShellDark}
                  onSelectGroup={(view) => {
                    setSettingsView(view);
                    setMobileView('detail');
                  }}
                />
              )}
            </>
          ) : activeModule === 'notifications' ? (
            <NotificationsN2ListPanel
              selectedId={selectedId}
              isShellDark={isShellDark}
              onSelectNotification={(id) => {
                setSelectedId(id);
                setMobileView('detail');
              }}
            />
          ) : null}
        </div>

        {/* ═══ 6. Panel N3 (Workspace / Foco) ═══ */}
        <div
          className={`flex-1 relative flex flex-col overflow-hidden panel-n3-clean transition-colors duration-500 ease-in-out ${
            feedNinjaActive ? 'bg-transparent text-white' : ''
          } ${mobileView === 'detail' || mobileView === 'context' ? 'flex' : 'hidden md:flex'}`}
          style={isShellDark ? { backgroundColor: 'var(--panel-n3)' } : undefined}
        >
          {activeModule === 'chats' ? (
            <ChatDemoN3DetailPanel
              isShellDark={isShellDark}
              feedNinjaActive={feedNinjaActive}
              selectedId={selectedId}
              isEmpty={isEmpty}
              isNoteBubbleOpen={isNoteBubbleOpen}
              noteDraft={noteDraft}
              isSavingNote={isSavingNote}
              justSavedNote={justSavedNote}
              demoNotes={demoNotes}
              isN4Open={isN4Open}
              onBackClick={() => setMobileView('list')}
              onToggleEmpty={() => setIsEmpty(!isEmpty)}
              onToggleNoteBubble={() => setIsNoteBubbleOpen(!isNoteBubbleOpen)}
              onOpenN4History={handleOpenN4History}
              onCloseN4={handleCloseN4}
              onNoteDraftChange={setNoteDraft}
              onSaveNote={handleSaveNote}
              onDirectToChat={() => {
                setFeedNinjaActive(false);
                setSelectedId('new-chat');
                setIsEmpty(false);
                setMobileView('detail');
              }}
            />
          ) : activeModule === 'profiles' ? (
            /* ─── N3 según la vista anidada del Perfil ─── */
            profileView === 'timeline' ? (
              <ProfilesN3DetailPanel
                profileId={selectedId}
                isShellDark={isShellDark}
                onBackClick={() => setMobileView('list')}
              />
            ) : profileView === 'contacts' ? (
              <ContactsN3Detail
                contactId={selectedId}
                isShellDark={isShellDark}
                onBackClick={() => setMobileView('list')}
              />
            ) : (
              <div className="relative w-full h-full flex flex-col">
                {/* N3 — Contenedor Dinámico de Configuraciones */}
                <SettingsN3DetailPanel
                  activeView={settingsView}
                  isShellDark={isShellDark}
                  onBackClick={() => setMobileView('list')}
                  onOpenCreateProduct={() => setIsCreateProductOpen(true)}
                  products={storeProducts}
                />

                {/* N4 — Focus Overlay de creación de producto (absoluto sobre N3) */}
                {isCreateProductOpen && (
                  <CatalogN4CreateProductForm
                    onSave={handleSaveProduct}
                    onClose={() => setIsCreateProductOpen(false)}
                    isShellDark={isShellDark}
                  />
                )}
              </div>
            )
          ) : activeModule === 'notifications' ? (
            <NotificationsN3DetailPanel
              notificationId={selectedId}
              isShellDark={isShellDark}
              onBackClick={() => setMobileView('list')}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LayoutDemo;