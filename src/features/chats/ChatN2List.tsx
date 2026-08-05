/**
 * @module ChatN2List
 * @description Feed polimórfico del panel N2.
 * Componente [List] que renderiza dinámicamente según el viewMode:
 * - 'chats': Renderiza ChatN2FeedCard (contactos/DMs) con filtro omnicanal
 * - 'posts': Renderiza PostFeedCard (publicaciones RRSS) con filtro por channel
 *
 * Manejo de estados: Loading (Skeleton), Error (con Retry),
 * Empty State y Lista Normal.
 *
 * Filtrado memoizado con useMemo para optimización de rendimiento.
 * Regla de Identidad Única: sin fallback legacy de WhatsApp.
 */

import React, { useMemo } from 'react';
import { SearchX, AlertCircle, RefreshCw, Send } from 'lucide-react';
import type { Contact, PlatformFilter, FilterMode, ActivePlatform } from '../../types';
import type { SocialPost } from './types';
import { ChatN2FeedCard } from './ChatN2FeedCard';
import { PostFeedCard } from './PostFeedCard';
import { ChatN2Skeleton } from './ChatN2Skeleton';

export interface ChatN2ListProps {
  // Datos
  contacts: Contact[];
  posts?: SocialPost[];
  // Estados
  viewMode: FilterMode;
  isLoading: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  searchQuery: string;
  activePlatform: PlatformFilter;
  /** Handle del usuario actual (sin @) para el empty state viral — /@handle */
  currentUserHandle?: string;
  // Handlers
  activeContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  onSelectPost?: (post: SocialPost) => void;
  /** Callback al hacer clic en el autor de un post → navegación a /@handle */
  onAuthorClick?: (post: SocialPost) => void;
}

// ──────────────────────────────────────────────
// Utilitarios de filtrado (Identidad Única)
// ──────────────────────────────────────────────

/**
 * Filtra contactos por búsqueda textual y plataforma activa.
 * SIN fallback legacy de WhatsApp.
 * Reglas:
 *   - 'all': Muestra todos los contactos únicos.
 *   - 'ninjabot': Contactos nativos de la plataforma (platform=ninjabot o nulo).
 *   - Plataforma específica: Evalúa platform + linkedPlatforms.
 */
const filterContacts = (
  contacts: Contact[],
  searchQuery: string,
  activePlatform: PlatformFilter
): Contact[] => {
  let result = contacts;

  // 1. Filtro por búsqueda textual (omnicanal: nombre, email, teléfono, último mensaje)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        (c.lastMessage?.toLowerCase() ?? '').includes(q)
    );
  }

  // 2. Filtro por plataforma (Identidad Única, SIN legacy WhatsApp)
  if (activePlatform !== 'all') {
    result = result.filter((c) => {
      // Para 'ninjabot': grupo fuente nativa — nativos + Google + Facebook
      if (activePlatform === 'ninjabot') {
        return (
          !c.platform ||
          c.platform === 'ninjabot' ||
          c.originPlatform === 'ninjabot' ||
          c.originPlatform === 'google' ||
          c.originPlatform === 'facebook'
        );
      }
      // Para plataformas específicas: evaluar platform activo + linkedPlatforms
      const platform = c.platform as ActivePlatform | undefined;
      if (platform === activePlatform) return true;
      // Evaluar linkedPlatforms
      if (c.linkedPlatforms?.includes(activePlatform as ActivePlatform)) return true;
      return false;
    });
  }

  return result;
};

/**
 * Filtra posts por búsqueda textual y por canal (plataforma social).
 * Soporta filtrado dual cuando viewMode === 'posts'.
 */
const filterPosts = (
  posts: SocialPost[],
  searchQuery: string,
  activePlatform: PlatformFilter
): SocialPost[] => {
  let result = posts;

  // 1. Filtro por búsqueda textual
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = posts.filter(
      (p) =>
        p.authorName.toLowerCase().includes(q) ||
        p.authorHandle.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }

  // 2. Filtro por canal (cuando no es 'all' y no es 'ninjabot')
  if (activePlatform !== 'all' && activePlatform !== 'ninjabot') {
    result = result.filter((p) => p.channel === activePlatform);
  }

  return result;
};

// ──────────────────────────────────────────────
// Subcomponentes de estado
// ──────────────────────────────────────────────

const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
    <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
    <p className="text-sm font-medium text-gray-700 mb-1">Algo salió mal</p>
    <p className="text-xs text-gray-500 mb-4 max-w-[200px]">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand px-4 py-2 rounded-full hover:bg-gray-800 active:bg-gray-700 transition-colors"
      >
        <RefreshCw size={12} />
        Reintentar
      </button>
    )}
  </div>
);

const EmptyState: React.FC<{ mode: FilterMode; platform: PlatformFilter }> = ({ mode, platform }) => {
  const isPosts = mode === 'social_feed';
  const platformLabel = platform !== 'all' ? ` de ${platform}` : '';
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <SearchX className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">
        {isPosts ? 'No se encontraron posts' : `No se encontraron chats${platformLabel}`}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {isPosts ? 'No hay publicaciones para esta red' : 'Intenta con otros filtros de búsqueda'}
      </p>
    </div>
  );
};

/**
 * InviteEmptyState — Estado vacío viral B/N para el filtro "Todos".
 * Dispara una invitación por WhatsApp con el perfil público /@handle.
 */
const InviteEmptyState: React.FC<{ currentUserHandle: string }> = ({ currentUserHandle }) => {
  const handleInvite = () => {
    const profileUrl = window.location.origin + '/@' + currentUserHandle;
    const waText = encodeURIComponent(
      '¡Hola! Conéctate conmigo en mi nueva red de negocios Ninjabot y hablemos por aquí: ' + profileUrl
    );
    window.open('https://api.whatsapp.com/send?text=' + waText, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleInvite}
      className="flex flex-col items-center justify-center h-full w-full bg-transparent rounded-xl text-center p-6 cursor-pointer hover:bg-neutral-900 transition-colors"
    >
      <Send className="w-8 h-8 text-white" />
      <span className="text-sm font-medium text-gray-400 mt-3">Invitar amigos</span>
    </button>
  );
};

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────

export const ChatN2List: React.FC<ChatN2ListProps> = ({
  contacts,
  posts = [],
  viewMode,
  isLoading,
  errorMessage,
  onRetry,
  searchQuery,
  activePlatform,
  currentUserHandle,
  activeContactId,
  onSelectContact,
  onSelectPost,
  onAuthorClick,
}) => {
  // Filtrado memoizado por viewMode
  const filteredContacts = useMemo(
    () => filterContacts(contacts, searchQuery, activePlatform),
    [contacts, searchQuery, activePlatform]
  );

  const filteredPosts = useMemo(
    () => filterPosts(posts, searchQuery, activePlatform),
    [posts, searchQuery, activePlatform]
  );

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto divide-y divide-black/5">
        <ChatN2Skeleton count={6} />
      </div>
    );
  }

  // ── Error State ──
  if (errorMessage) {
    return (
      <div className="flex-1 overflow-y-auto">
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  // ── Renderizado según viewMode ──
  if (viewMode === 'conversaciones') {
    // Empty State viral B/N: solo con filtro "Todos" (all) y handle disponible
    if (filteredContacts.length === 0 && activePlatform === 'all' && currentUserHandle) {
      return (
        <div className="flex-1 overflow-hidden">
          <InviteEmptyState currentUserHandle={currentUserHandle} />
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto divide-y divide-black/5">
        {filteredContacts.length === 0 ? (
          <EmptyState mode={viewMode} platform={activePlatform} />
        ) : (
          filteredContacts.map((contact) => (
            <ChatN2FeedCard
              key={contact.id}
              contact={contact}
              isSelected={contact.id === activeContactId}
              onSelect={() => onSelectContact(contact)}
            />
          ))
        )}
      </div>
    );
  }

  // viewMode === 'social_feed' — renderizado de posts
  return (
    <div className="flex-1 overflow-y-auto divide-y divide-black/5">
      {filteredPosts.length === 0 ? (
        <EmptyState mode={viewMode} platform={activePlatform} />
      ) : (
        filteredPosts.map((post) => (
          <PostFeedCard
            key={post.id}
            post={post}
            onReply={onSelectPost || (() => {})}
            onAuthorClick={onAuthorClick}
          />
        ))
      )}
    </div>
  );
};

export default ChatN2List;