import React from 'react';
import type { Contact, Funnel, LeadStage, MessagingPlatform, NavigationTab, PlatformConnection } from '../../types';

import { GlobalHeader } from './GlobalHeader';
import { SidebarN1 } from './SidebarN1';
import { ContactsPanel } from '../ContactsPanel';
import { NewContactModal } from '../NewContactModal';
import { ChatsFeature } from '../../features/chats/ChatsFeature';
import { useEnvironment } from '../../env/EnvironmentContext';
import { MOCK_CONTACTS, MOCK_NOTES, MOCK_POSTS, MOCK_PLATFORM_STATUS } from '../../demo/mockData';
import { PlatformConnectModal } from '../PlatformConnectModal';
import { SaleRegistrationModal } from '../SaleRegistrationModal';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-black/5 text-slate-400 p-6">
    <h3 className="text-base font-semibold text-slate-600">{title}</h3>
    <p className="text-xs text-slate-400 mt-1">Próximamente en desarrollo</p>
  </div>
);

export interface MainLayoutProps {
  // Sesión
  userName: string;
  avatarUrl: string | null;
  onLogout: () => void;

  // Contactos / estado global
  contacts: Contact[];
  activeContactId: string | null;
  activeContact: Contact | null;
  unreadMessagesCount: number;
  funnels: Funnel[];
  capiActive: boolean;

  // Navegación
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isMobile: boolean;
  mobileSubView: 'list' | 'chat';
  onMobileSubViewChange: (view: 'list' | 'chat') => void;
  onSelectContact: (contact: Contact) => void;

  // Búsqueda
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;

  // AI / mensajes
  isLoadingAi: boolean;
  onSendMessage: (text: string, isFromUser?: boolean) => void;
  onToggleAiAgent: (enabled: boolean) => void;
  onChangeLeadStage: (stage: LeadStage, targetContactId?: string) => void;

  // Contacts CRUD
  onAddContact: (
    name: string,
    phone: string,
    leadStage: LeadStage,
    firstMessage: string,
    city?: string,
    interest?: string
  ) => void;
  onDeleteContact: (contactId: string) => void;
  fetchContactos: () => Promise<void>;

  // Integraciones / plataformas
  integrationsEnabled: boolean;
  onToggleIntegrations: (enabled: boolean) => void;
  platformStatus: Record<string, PlatformConnection>;
  onConnectPlatform: (platform: MessagingPlatform) => void;

  // Modales
  isNewContactModalOpen: boolean;
  onNewContactModalClose: () => void;
  platformToConnect: MessagingPlatform | null;
  onPlatformConnectClose: () => void;
  onPlatformConnectSuccess: (email: string, name: string) => void;
  saleModalContactId: string | null;
  onSaleModalClose: () => void;
  onOpenSaleModal: () => void;
  activeContactForSale: Contact | null;
  onRegisterSale: (saleData: { contactId: string; amount: number; description: string }) => Promise<void>;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  userName: _userName,
  avatarUrl: _avatarUrl,
  onLogout,
  contacts,
  activeContactId: _activeContactId,
  activeContact: _activeContact,
  unreadMessagesCount,
  funnels,
  capiActive: _capiActive,
  activeTab,
  onTabChange,
  isMobile,
  mobileSubView: _mobileSubView,
  onMobileSubViewChange: _onMobileSubViewChange,
  onSelectContact,
  searchQuery: _searchQuery,
  onSearchQueryChange: _onSearchQueryChange,
  isLoadingAi: _isLoadingAi,
  onSendMessage: _onSendMessage,
  onToggleAiAgent: _onToggleAiAgent,
  onChangeLeadStage: _onChangeLeadStage,
  onAddContact,
  onDeleteContact,
  fetchContactos,
  integrationsEnabled,
  onToggleIntegrations,
  platformStatus: _platformStatus,
  onConnectPlatform,
  isNewContactModalOpen,
  onNewContactModalClose,
  platformToConnect,
  onPlatformConnectClose,
  onPlatformConnectSuccess,
  saleModalContactId,
  onSaleModalClose,
  onOpenSaleModal,
  activeContactForSale,
  onRegisterSale,
}) => {
  const { environment } = useEnvironment();

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden font-sans bg-neutral-50/50 text-slate-900 dark:bg-neutral-950/50 dark:text-white">
      {/* Header Global fijo arriba (componente ACTUAL — responsivo en todas las resoluciones) */}
      <div className="relative shrink-0">
        <GlobalHeader notificationCount={unreadMessagesCount} />
      </div>

      {/* Contenedor principal: columna en móvil (SidebarN1 barra superior + contenido debajo),
          fila en desktop (SidebarN1 izquierda + contenido derecha). Antes era siempre `flex` (fila),
          lo que en móvil hacía que SidebarN1 (w-full shrink-0) empujara al main fuera del
          viewport y el overflow-hidden lo recortara. */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* N1: Sidebar (componente ACTUAL — responsivo: barra superior en móvil, lateral en desktop) */}
        <SidebarN1
          activeTab={activeTab === 'chats' ? 'chats' : 'contacts'}
          onTabChange={(tab) => onTabChange(tab)}
          integrationsEnabled={integrationsEnabled}
          onToggleIntegrations={onToggleIntegrations}
          onLogout={onLogout}
        />

        {/* Contenido: cambia según activeTab.
            min-h-0 en lugar de h-full: en móvil (flex-col) el main debe ocupar el
            espacio restante tras el SidebarN1 (h-12). Con h-full forzaba el 100%
            del alto del contenedor padre, desbordando y siendo recortado por
            overflow-hidden. min-h-0 permite que el scroll interno funcione. */}
        <main className="flex-1 w-full min-h-0 overflow-hidden flex">
          {!isMobile && (
            <>
              {activeTab === 'chats' && (environment === 'sandbox' ? (<ChatsFeature
                contacts={MOCK_CONTACTS}
                notes={MOCK_NOTES}
                posts={MOCK_POSTS}
                platformStatus={MOCK_PLATFORM_STATUS}
                initialActiveEntity="ninjabot"
                useInternalDataSource={false}
                onConnectPlatform={onConnectPlatform}
              />) : (<ChatsFeature onConnectPlatform={onConnectPlatform} />))}
              {activeTab === 'contacts' && <Placeholder title='👥 Modulo de Contactos' />}
            </>
          )}

          {isMobile && (
            <div className="w-full flex-1 min-h-0 bg-transparent flex flex-col overflow-hidden relative">
              {activeTab === 'chats' && (
                <>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {environment === 'sandbox' ? (
                      <ChatsFeature
                        contacts={MOCK_CONTACTS}
                        notes={MOCK_NOTES}
                        posts={MOCK_POSTS}
                        platformStatus={MOCK_PLATFORM_STATUS}
                        initialActiveEntity="ninjabot"
                        useInternalDataSource={false}
                        onOpenSaleModal={() => onOpenSaleModal()}
                        onConnectPlatform={onConnectPlatform}
                      />
                    ) : (
                      <ChatsFeature onOpenSaleModal={() => onOpenSaleModal()} onConnectPlatform={onConnectPlatform} />
                    )}
                  </div>
                </>
              )}

              {/* Vista no-chats: solo Contactos (MobileTabs/SidebarN1 solo exponen chats y contacts) */}
              {activeTab !== 'chats' && (
                <div className="w-full flex-1 min-h-0 flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {activeTab === 'contacts' && (
                      <ContactsPanel contacts={contacts}
                        onSelectContact={(c) => { onSelectContact(c); onTabChange('chats'); }}
                        onDeleteContact={onDeleteContact} fetchContactos={fetchContactos} isMobileLayout={true} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <NewContactModal isOpen={isNewContactModalOpen} onClose={onNewContactModalClose} funnels={funnels} onAddContact={onAddContact} />
      <PlatformConnectModal isOpen={platformToConnect !== null} onClose={onPlatformConnectClose} platform={platformToConnect} onConnectSuccess={onPlatformConnectSuccess} />

      <SaleRegistrationModal
        isOpen={saleModalContactId !== null}
        onClose={onSaleModalClose}
        contact={activeContactForSale}
        onRegisterSale={onRegisterSale}
      />
    </div>
  );
};