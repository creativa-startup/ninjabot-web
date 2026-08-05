/**
 * @module ProfileN3DetailPanel
 * @description Panel taxonómico N3 (Detail) para el perfil público de un "Ninjat".
 * GRADUADO desde el Sandbox (src/demo/profiles/ProfilesN3DetailPanel.tsx) a producción.
 *
 * Diseño aplicado:
 * - Transparencias puras (bg-transparent) — el panel hereda el fondo del shell N3.
 * - Scroll único del panel (ProfileBody flex-1 overflow-y-auto).
 * - ProfileHeaderCard (Capa 1 — bordes rectos 0px, superficies glass-card) como
 *   cabecera unificada. CORRE con el scroll (pt-8 sm:pt-10 viaja con el header).
 * - ControlProfileTabs: barra STICKY (sticky top-0) con backdrop-blur. Feed ↔ Store.
 * - Feed: histórico real de Ninjats vía PostFeedCard (datos de postService.fetchPostsByUser).
 * - Store: vitrina ProductCard (Social Commerce) — empty-state elegante sin datos mock.
 *
 * Datos REALES de producción:
 * - profile:  NinjatProfile recuperada de Supabase (getProfileByHandle).
 * - posts:    SocialPost[] del histórico del creador (postService.fetchPostsByUser).
 * - stats:    NinjatProfileStats reactivas (useNinjatProfile).
 * - error:    mensaje no bloqueante (handle inexistente o fallo de red).
 */

import React, { useState } from 'react';
import { ChevronLeft, User, ShoppingBag } from 'lucide-react';
import { ProfileHeaderCard, type ProfileHeaderCardProfile } from './ProfileHeaderCard';
import { ControlProfileTabs, type ProfileTab } from './ControlProfileTabs';
import type { SocialPost } from './types';
import type { NinjatProfileStats } from './hooks/useNinjatProfile';
import { PostFeedCard } from './PostFeedCard';
import { ProductCard, type ProductCardProduct } from '../../components/ui/ProductCard';
import { useTheme } from '../../theme/ThemeContext';

export interface NinjatProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  handle?: string | null;
  role?: string | null;
  auth_source?: string | null;
  phone?: string | null;
  [key: string]: any;
}

export interface ProfileN3DetailPanelProps {
  profile: NinjatProfile;
  posts: SocialPost[];
  /** Estado de carga del histórico de posts */
  isLoadingPosts?: boolean;
  /** Callback de retorno → vuelve al feed/social (N2) */
  onBack: () => void;
  /** Callback opcional al hacer clic en autor de un post → navega a /@handle */
  onAuthorClick?: (post: SocialPost) => void;
  /** Estadísticas reactivas del perfil calculadas por useNinjatProfile */
  stats?: NinjatProfileStats;
  /** Mensaje de error no bloqueante (handle inexistente o fallo de red) */
  error?: string | null;
}

/* ─── Punto de extensión: catálogo de productos real vía API de productos ───
 * En producción los productos se alimentarán desde la tabla `products`
 * (Supabase) — ver seed.sql. Mientras tanto, la grilla Tienda muestra un
 * empty-state elegante sin datos simulados. */
const EMPTY_PRODUCTS: ProductCardProduct[] = [];

/** Resuelve la URL del avatar del perfil (compat: avatar_url o avatarUrl) */
const resolveAvatarUrl = (profile: NinjatProfile): string | null => {
  const url = profile.avatar_url || profile.avatarUrl;
  return typeof url === 'string' && url.trim() ? url : null;
};

/** Mapea NinjatProfile (Supabase) → ProfileHeaderCardProfile (Capa 1) */
const toProfileHeaderProfile = (profile: NinjatProfile, externalStats?: NinjatProfileStats): ProfileHeaderCardProfile => {
  const displayName =
    profile.full_name || profile.email?.split('@')[0] || 'Ninjat';

  return {
    id: profile.id,
    name: displayName,
    handle: profile.handle || '',
    bio: typeof profile.bio === 'string' ? profile.bio : undefined,
    avatarUrl: resolveAvatarUrl(profile),
    bannerUrl: typeof profile.banner_url === 'string' ? profile.banner_url : undefined,
    // Seguidores reales del perfil; fallback al total de likes del hook reactivo.
    followers: typeof profile.followers === 'number' ? profile.followers : (externalStats?.totalLikes ?? 0),
    location: typeof profile.location === 'string' ? profile.location : undefined,
    website: typeof profile.website === 'string' ? profile.website : undefined,
    isOnline: true,
  };
};

export const ProfileN3DetailPanel: React.FC<ProfileN3DetailPanelProps> = ({
  profile,
  posts,
  isLoadingPosts = false,
  onBack,
  onAuthorClick,
  stats: externalStats,
  error,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<ProfileTab>('feed');

  const headerProfile = toProfileHeaderProfile(profile, externalStats);
  const displayName = headerProfile.name || 'Ninjat';

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${
        isDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
      }`}
    >
      {/* ═══ Cuerpo N3 — ProfileBody (header + tabs + contenido) — scroll ÚNICO del panel ═══ */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-transparent">
        {/* ═══ Header del Perfil (ProfileHeaderCard — Capa 1) — CORRE con el scroll ═══ */}
        <div className="relative pt-8 sm:pt-10">
          {/* Botón atrás (móvil) — integrado en el flujo, antes de la cabecera */}
          <button
            type="button"
            onClick={onBack}
            title="Volver al timeline"
            className="md:hidden ml-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-black/50 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>

          <ProfileHeaderCard
            profile={headerProfile}
            isEmbedded={false}
            isDark={isDark}
          />
        </div>

        {/* ─── Navegación por pestañas: Feed ↔ Tienda (Social Commerce) — STICKY en el top ─── */}
        <div
          className={`sticky top-0 z-10 backdrop-blur-md border-b ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-white/90 border-black/5'
          }`}
        >
          <ControlProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDark={isDark}
          />
        </div>

        {/* ─── Contenido condicional: Feed (histórico real) ↔ Store (catálogo) ─── */}
        <div className="px-4 sm:px-5 pb-6 flex flex-col gap-3 transition-colors duration-500 bg-transparent">
          {/* ─── TAB STORE: vitrina ProductCard (Social Commerce) ─── */}
          {activeTab === 'store' && (
            EMPTY_PRODUCTS.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EMPTY_PRODUCTS.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isDark={isDark}
                    onAddToCart={(id) => {
                      // Punto de extensión: abrir carrito/detalle de producto N4 en el futuro.
                      console.log('[Social Commerce · N4 futuro] Producto agregado al carrito:', id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-white/50">
                  Tienda en preparación
                </p>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
                  El catálogo de productos aparecerá aquí cuando esté disponible
                </p>
              </div>
            )
          )}

          {/* ─── TAB FEED: histórico real de Ninjats (postService.fetchPostsByUser) ─── */}
          {activeTab === 'store' ? null : (
            <div className="flex flex-col gap-3">
              {error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <User className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-white/50">
                    {error}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
                    Verifica que el handle sea correcto o intenta más tarde
                  </p>
                </div>
              ) : isLoadingPosts ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-white/40">
                  <div className="w-8 h-8 rounded-full border-2 border-black/10 dark:border-white/10 border-t-gray-400 animate-spin mb-3" />
                  <p className="text-xs font-medium">Cargando Ninjats...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <User className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-white/50">
                    {displayName} aún no tiene Ninjats
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
                    Los Ninjats aparecerán aquí cuando publique
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostFeedCard
                    key={post.id}
                    post={post}
                    onReply={() => {}}
                    onAuthorClick={onAuthorClick}
                    variant="light"
                    isTimelineView={false}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileN3DetailPanel;