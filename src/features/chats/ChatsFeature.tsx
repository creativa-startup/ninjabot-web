/**
 * @module ChatsFeature
 * @description Orquestador central del módulo Chats — composición declarativa
 * estricta de hooks maestros. Este componente no contiene lógica de estado
 * propia más allá de la captura del perfil actual:
 *
 *   1. useChatsData        → contactos, mensajes, notas (Supabase).
 *   2. useNavigationState  → navegación espacial N1–N4 + searchQuery.
 *   3. usePostsFeed        → feed de posts (carga, publicación optimista).
 *   4. useNinjatProfile    → perfil público /@handle (Club Privado).
 *   5. useActiveEntity     → resolución de tenant + filtros de bajo nivel.
 *
 * Single Source of Truth: datos desde Supabase. Fallback a mocks ELIMINADO.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contact, MessagingPlatform, PlatformConnection, LeadStage, Note, LayoutDensity, EntityFilter } from '../../types';
import type { SocialPost } from './types';
import type { TrendItem } from './FeedPanelNinja';
import { ChatN2ListPanel } from './ChatN2ListPanel';
import { ChatN3DetailPanel } from './ChatN3DetailPanel';
import { ChatN4SubDetailPanel } from './ChatN4SubDetailPanel';
import { FeedNinjaDetail } from './FeedNinjaDetail';
import { ProfileN3DetailPanel } from './ProfileN3DetailPanel';
import { useChatsData } from '../../hooks/useChatsData';
import { useNavigationState } from './hooks/useNavigationState';
import { getPerfilActual } from '../../services/supabase';
import { usePostsFeed } from './hooks/usePostsFeed';
import { useNinjatProfile } from './hooks/useNinjatProfile';
import { useActiveEntity } from './hooks/useActiveEntity';

// ── Props ──

export interface ChatsFeatureProps {
  contacts?: Contact[];
  notes?: Note[];
  platformStatus?: Record<string, PlatformConnection>;
  posts?: SocialPost[];
  onSendMessage?: (contactId: string, text: string, isFromUser?: boolean) => void;
  onConnectPlatform?: (platform: MessagingPlatform) => void;
  onToggleAiAgent?: (contactId: string, enabled: boolean) => void;
  onChangeLeadStage?: (contactId: string, stage: LeadStage) => void;
  onAddNote?: (contactId: string, text: string) => void;
  onEditNote?: (noteId: string, newText: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onOpenSaleModal?: (contact: Contact) => void;
  onIntegrateCatalog?: () => void;
  density?: LayoutDensity;
  initialActiveEntity?: EntityFilter;
  useInternalDataSource?: boolean;
}

// ── Componente — composición de hooks maestros ──

export const ChatsFeature: React.FC<ChatsFeatureProps> = ({
  contacts: externalContacts,
  notes: externalNotes,
  platformStatus: externalPlatformStatus,
  posts: externalPosts,
  onSendMessage: externalOnSendMessage,
  onConnectPlatform,
  onToggleAiAgent: externalOnToggleAiAgent,
  onChangeLeadStage: externalOnChangeLeadStage,
  onAddNote: externalOnAddNote,
  onEditNote: externalOnEditNote,
  onDeleteNote: externalOnDeleteNote,
  onOpenSaleModal,
  onIntegrateCatalog,
  density: _density = 'comfortable',
  initialActiveEntity,
  useInternalDataSource = true,
}) => {
  // ── Hook 1: Datos Supabase ──
  const {
    contacts: internalContacts,
    messagesByContact,
    allNotes: internalAllNotes,
    platformStatus: internalPlatformStatus,
    sendMessage: internalSendMessage,
    addNote: internalAddNote,
    editNote: internalEditNote,
    deleteNote: internalDeleteNote,
    loadMessages,
    loadNotes,
    reload,
  } = useChatsData(useInternalDataSource);

  const contacts: Contact[] = useInternalDataSource ? internalContacts : (externalContacts ?? []);
  const allNotes: Note[] = useInternalDataSource ? internalAllNotes : (externalNotes ?? []);
  const resolvedPlatformStatus: Record<string, PlatformConnection> = useInternalDataSource
    ? internalPlatformStatus
    : (externalPlatformStatus ?? { whatsapp: 'disconnected', messenger: 'disconnected', instagram: 'disconnected' });
  const connectedPlatforms: string[] = Object.entries(resolvedPlatformStatus)
    .filter(([, status]) => status === 'connected')
    .map(([platform]) => platform);

  // ── Captura perfil actual (auth_source + handle viral) ──
  const [authSource, setAuthSource] = useState<string | undefined>(undefined);
  const [currentUserHandle, setCurrentUserHandle] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!useInternalDataSource || initialActiveEntity) return;
    let mounted = true;
    getPerfilActual()
      .then((perfil) => {
        if (!mounted) return;
        setAuthSource(perfil.auth_source || 'ninjabot');
        if (perfil.handle) setCurrentUserHandle(perfil.handle);
      })
      .catch(() => {
        if (mounted) setAuthSource('ninjabot');
      });
    return () => { mounted = false; };
  }, [useInternalDataSource, initialActiveEntity]);

  // ── Hook 2: Navegación N1–N4 ──
  const {
    navState,
    searchQuery,
    setSearchQuery,
    handleSelectContact: handleSelectContactById,
    handleCloseN3,
    handleOpenN4,
    handleCloseN4,
    handleToggleFeedNinja,
  } = useNavigationState();

  // ── Hook 3: Feed posts ──
  const {
    posts,
    activeHashtag,
    setActiveHashtag,
    isLoading: isLoadingPosts,
    error: postsError,
    handleCreatePost,
    handleRefreshFeed,
  } = usePostsFeed(searchQuery, { initialPosts: externalPosts ?? [], enabled: useInternalDataSource });

  // ── Hook 4: Perfil Ninjat público ──
  const navigate = useNavigate();
  const { ninjatProfile, ninjatPosts, ninjatProducts, isLoadingNinjat, error: ninjatError, stats: ninjatStats } = useNinjatProfile();

  // ── Hook 5: Entidad activa + filtros N2 ──
  const { activeEntity, filterMode, platformFilter, handleEntityChange } = useActiveEntity(authSource, {
    initialEntity: initialActiveEntity,
  });

  // ── Handlers ──
  const handleAuthorClick = useCallback((post: SocialPost) => {
    const handle = post.handle ?? post.authorHandle.replace(/^@/, '');
    if (handle) navigate(`/@${handle}`);
  }, [navigate]);

  const handleSelectContact = useCallback((contact: Contact) => handleSelectContactById(contact.id), [handleSelectContactById]);
  const handleRetry = useCallback(() => {
    if (useInternalDataSource) { reload(); handleRefreshFeed(); }
    else handleCloseN3();
  }, [useInternalDataSource, reload, handleRefreshFeed, handleCloseN3]);

  const onSendMessage = useInternalDataSource ? internalSendMessage : (externalOnSendMessage ?? (() => {}));
  const onAddNote = useInternalDataSource ? internalAddNote : (externalOnAddNote ?? (() => {}));
  const onEditNote = useInternalDataSource ? internalEditNote : (externalOnEditNote ?? (() => {}));
  const onDeleteNote = useInternalDataSource ? internalDeleteNote : (externalOnDeleteNote ?? (() => {}));

  const handleSendMessage = (text: string, _isFromUser?: boolean) => {
    if (navState.selectedChatId) onSendMessage(navState.selectedChatId, text, _isFromUser);
  };
  const handleToggleAiAgent = (enabled: boolean) => {
    if (navState.selectedChatId && externalOnToggleAiAgent) externalOnToggleAiAgent(navState.selectedChatId, enabled);
  };
  const handleChangeLeadStage = (stage: LeadStage) => {
    if (navState.selectedChatId && externalOnChangeLeadStage) externalOnChangeLeadStage(navState.selectedChatId, stage);
  };

  const activeContact: Contact | null = navState.selectedChatId
    ? contacts.find((c) => c.id === navState.selectedChatId) ?? null
    : null;

  useEffect(() => {
    if (navState.selectedChatId && useInternalDataSource) {
      loadMessages(navState.selectedChatId);
      loadNotes(navState.selectedChatId);
    }
  }, [navState.selectedChatId, useInternalDataSource, loadMessages, loadNotes]);

  const mockTrends: TrendItem[] = [
    { tag: 'Ventas', count: 12 },
    { tag: 'Marketing', count: 8 },
  ];

  return (
    <div className="flex flex-1 overflow-hidden relative w-full h-full">
      {/* N2: LIST PANEL */}
      <section className={`w-full md:w-[360px] lg:w-[400px] flex-col shrink-0 panel-n2-clean ${
          navState.feedNinjaActive || navState.selectedChatId !== null ? 'hidden md:flex' : 'flex'
        }`}>
        <ChatN2ListPanel
          contacts={contacts}
          activeContactId={navState.selectedChatId}
          onSelectContact={handleSelectContact}
          posts={posts}
          onSelectPost={() => {}}
          onAuthorClick={handleAuthorClick}
          viewMode={filterMode}
          onViewModeChange={() => {}}
          activeEntity={activeEntity}
          onFilterChange={handleEntityChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activePlatform={platformFilter}
          connectedPlatforms={connectedPlatforms}
          onIntegratePlatform={onConnectPlatform ? (p) => onConnectPlatform(p as MessagingPlatform) : undefined}
          currentUserHandle={currentUserHandle}
          feedNinjaActive={navState.feedNinjaActive}
          onToggleFeedNinja={handleToggleFeedNinja}
          onRefreshFeed={handleRefreshFeed}
          trends={mockTrends}
          activeHashtag={activeHashtag}
          onSelectHashtag={setActiveHashtag}
          isLoading={isLoadingPosts}
          errorMessage={postsError}
          onRetry={handleRetry}
        />
      </section>

      {/* N3: DETAIL PANEL */}
      <main className={`flex-1 flex-col relative overflow-hidden panel-n3-clean ${
          navState.feedNinjaActive || navState.selectedChatId !== null || ninjatProfile !== null ? 'flex' : 'hidden md:flex'
        }`}>
        {navState.feedNinjaActive ? (
          <FeedNinjaDetail
            posts={posts}
            activeHashtag={activeHashtag}
            onAuthorClick={handleAuthorClick}
            onRefreshFeed={handleRefreshFeed}
            onCreatePost={handleCreatePost}
          />
        ) : ninjatProfile ? (
          <ProfileN3DetailPanel
            profile={ninjatProfile}
            posts={ninjatPosts}
            products={ninjatProducts}
            isLoadingPosts={isLoadingNinjat}
            stats={ninjatStats}
            error={ninjatError}
            onBack={() => navigate('/')}
            onAuthorClick={handleAuthorClick}
          />
        ) : !navState.selectedChatId ? (
          <div className="hidden md:flex h-full flex-col items-center justify-center text-gray-400">
            <p className="text-sm font-medium">Selecciona una conversación</p>
            <p className="text-xs text-gray-400 mt-1">Elige un chat de la lista para comenzar</p>
          </div>
        ) : activeContact ? (
          <div className="relative w-full h-full flex flex-col">
            <ChatN3DetailPanel
              contact={{ ...activeContact, messages: messagesByContact[activeContact.id] || activeContact.messages || [] }}
              tempLevel={activeContact.leadLevel ?? 3}
              channel={activeContact.platform || 'whatsapp'}
              onSendMessage={handleSendMessage}
              onToggleAiAgent={handleToggleAiAgent}
              onChangeLeadStage={handleChangeLeadStage}
              onBackClick={handleCloseN3}
              showBackArrow={true}
              onOpenSaleModal={onOpenSaleModal ? () => onOpenSaleModal(activeContact) : undefined}
              onOpenN4Actions={() => handleOpenN4('bot')}
              onOpenN4Notes={() => handleOpenN4('notes')}
              onIntegrateCatalog={onIntegrateCatalog}
            />
            {navState.isN4Open && (
              <div className="absolute inset-0 z-30 w-full h-full panel-n4-floating transition-all duration-200 ease-out">
                <ChatN4SubDetailPanel
                  contact={activeContact}
                  onToggleAiAgent={(enabled) => externalOnToggleAiAgent?.(activeContact.id, enabled)}
                  notes={allNotes.filter((n) => n.contactId === activeContact.id)}
                  onAddNote={(contactId, text) => onAddNote(contactId, text)}
                  onEditNote={onEditNote}
                  onDeleteNote={onDeleteNote}
                  onBack={handleCloseN4}
                  variant={navState.activeN4Tab === 'notes' ? 'back' : 'close'}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex h-full flex-col items-center justify-center text-gray-400">
            <p className="text-sm font-medium">Contacto no encontrado</p>
            <button onClick={handleCloseN3} className="mt-2 text-xs text-gray-600 underline hover:text-gray-900 transition-colors">
              Volver a la lista
            </button>
          </div>
        )}
      </main>
    </div>
  );
};