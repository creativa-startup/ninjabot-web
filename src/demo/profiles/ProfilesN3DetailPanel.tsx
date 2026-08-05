/**
 * @module ProfilesN3DetailPanel
 * @description Perfil del creador con Banner minimalista + Vitrina Grid (Panel N3).
 * Rediseño: cabecera de perfil unificada con ProfileHeaderCard (Capa 1 — bordes
 * rectos 0px, superficies glass-card) + vitrina en cuadrícula de contenido visual.
 * Todo maquetado localmente en el Sandbox con datos demo estáticos.
 *
 * Layout (móvil-first):
 *   - Contenedor principal: flex flex-col h-full w-full overflow-hidden.
 *   - ProfileBody (flex-1 overflow-y-auto flex flex-col) — scroll único del
 *     panel. El ProfileHeaderCard CORRE con el scroll (se desplaza y sale de
 *     la vista).
 *   - Wrapper del header: pt-8 sm:pt-10 — el padding top responsivo vive AQUÍ
 *     (top del body profile), dando aire generoso respecto al borde N3. Viaja
 *     con el header al hacer scroll y NUNCA interfiere con el sticky de tabs.
 *   - ControlProfileTabs: barra STICKY (sticky top-0) con backdrop-blur.
 *     Padding/margen cero alrededor del control de pestañas. Cuando el header
 *     sale de la vista, la barra se adhiere al top sin fugas de contenido.
 *   - Contenido de pestañas: wrapper con padding responsivo (px-4 sm:px-5 pb-6)
 *     que da aire lateral a la cuadrícula de la Tienda o la vitrina del Feed.
 *     El scroll vive en el ProfileBody (padre); el padding vive en el wrapper.
 *
 * Encapsulación: componente puro — solo recibe props y renderiza. No realiza
 * llamadas a BD ni conoce el módulo de Chats.
 */

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ProfileHeaderCard } from '../../features/chats/ProfileHeaderCard';
import { ControlProfileTabs } from '../ControlProfileTabs';
import { ProductCard, type ProductCardProduct } from '../../components/ui/ProductCard';
import { VideoCard } from '../../components/ui/VideoCard';

export interface ProfilesN3DetailPanelProps {
  /** Id del perfil a mostrar en el detalle */
  profileId?: string | null;
  /** Callback "atrás" — usado por el LayoutDemo para volver a N2 (móvil) */
  onBackClick?: () => void;
  /** Tema del shell maestro (dark/light) para adaptar colores base */
  isShellDark?: boolean;
}

/* ─── Catálogo de productos (Social Commerce — contrato ProductCard productivo) ─── */
const STORE_PRODUCTS: ProductCardProduct[] = [
  {
    id: 'prod-1',
    name: 'Plantilla de Reels',
    price: 29.99,
    currency: 'USD',
    sku: 'TPL-REELS-001',
    image_url: null,
  },
  {
    id: 'prod-2',
    name: 'Guía Growth Hacking',
    price: 19.99,
    currency: 'USD',
    sku: 'GUI-GROW-002',
    image_url: null,
  },
  {
    id: 'prod-3',
    name: 'Curso Embudos IA',
    price: 49.99,
    currency: 'USD',
    sku: 'CRS-FUNNEL-003',
    image_url: null,
  },
  {
    id: 'prod-4',
    name: 'Pack Mockups',
    price: 9.99,
    currency: 'USD',
    sku: 'PKG-MOCK-004',
    image_url: null,
  },
  {
    id: 'prod-5',
    name: 'Mentoría 1:1',
    price: 79.99,
    currency: 'USD',
    sku: 'MNT-ONE-005',
    image_url: null,
  },
  {
    id: 'prod-6',
    name: 'Kit Branding',
    price: 39.99,
    currency: 'USD',
    sku: 'KIT-BRAND-006',
    image_url: null,
  },
];

/* ─── Videos destacados del Feed (contrato VideoCard — Capa 2) ─── */
const FEED_VIDEOS: Array<{
  id: string;
  videoUrl: string;
  posterUrl: string;
  views: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  description: string;
}> = [
  {
    id: 'video-1',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    posterUrl: 'https://picsum.photos/seed/ninja-video-1/400/720',
    views: '12.4K',
    authorName: 'Mi Negocio',
    authorHandle: 'mi_negocio',
    authorAvatar: undefined,
    description: 'Nuevo reel mostrando el proceso creativo detrás de la campaña. 🎬',
  },
  {
    id: 'video-2',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    posterUrl: 'https://picsum.photos/seed/ninja-video-2/400/720',
    views: '8.1K',
    authorName: 'Mi Negocio',
    authorHandle: 'mi_negocio',
    authorAvatar: undefined,
    description: 'Detrás de cámaras del shoot de producto. 🔥',
  },
];

export const ProfilesN3DetailPanel: React.FC<ProfilesN3DetailPanelProps> = ({
  profileId: _profileId,
  onBackClick,
  isShellDark = false,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'store'>('feed');

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${
        isShellDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
      }`}
    >
      {/* ═══ Cuerpo N3 — ProfileBody (header + tabs + contenido) — scroll ÚNICO del panel ═══ */}
      <div className={`flex-1 overflow-y-auto flex flex-col bg-transparent`}>
        {/* ═══ Header del Perfil (ProfileHeaderCard — Capa 1) — CORRE con el scroll ═══
         * Sin margen ni padding externo: la cabecera hereda el fondo transparente
         * del panel N3. El botón atrás (móvil) está integrado en el flujo.
         * Al hacer scroll, este bloque se desplaza hacia arriba y sale de la vista.
         * El pt-8 sm:pt-10 da aire superior respecto al borde N3 (top del body profile). */}
        <div className="relative pt-8 sm:pt-10">
          {/* Botón atrás (móvil) — integrado en el flujo, antes de la cabecera */}
          <button
            type="button"
            onClick={onBackClick}
            title="Volver al timeline"
            className="md:hidden ml-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-black/50 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>

          <ProfileHeaderCard
            profile={{
              id: 'demo-profile',
              name: 'Mi Negocio',
              handle: 'mi_negocio',
              bio: 'Creando contenido que conecta marcas con personas. Automatización con IA + storytelling directo. 🚀',
              followers: 12800,
              isOnline: true,
            }}
            isEmbedded={false}
            isDark={true}
          />
        </div>

        {/* ─── Navegación por pestañas: Feed ↔ Tienda (Social Commerce) — STICKY en el top ───
         * Cuando el header corre y sale de la vista, esta barra se adhiere al top
         * del ProfileBody (scroll único) con efecto backdrop-blur. */}
        <div
          className={`sticky top-0 z-10 backdrop-blur-md border-b ${
            isShellDark ? 'bg-black/40 border-white/10' : 'bg-white/90 border-black/5'
          }`}
        >
          <ControlProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDark={isShellDark}
          />
        </div>

        {/* ─── Contenido condicional: Feed (vitrina) ↔ Store (catálogo Meta Commerce) ───
         * Wrapper con padding responsivo estandarizado — aire lateral elegante.
         * El scroll lo gestiona el ProfileBody (padre); aquí SOLO vive el padding. */}
        <div
          className={`px-4 sm:px-5 pb-6 flex flex-col gap-3 transition-colors duration-500 bg-transparent`}
        >
          {/* ─── Tab Tienda: cuadrícula de ProductCard (Social Commerce) ─── */}
          {activeTab === 'store' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STORE_PRODUCTS.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isDark={isShellDark}
                  onAddToCart={(id) => {
                    // Punto de extensión: abrir carrito/detalle de producto N4 en el futuro.
                    console.log('[Social Commerce · N4 futuro] Producto agregado al carrito:', id);
                  }}
                />
              ))}
            </div>
          )}

          {/* ─── Tab Feed: cuadrícula dinámica de VideoCard — 1 en móvil / 3 en desktop ─── */}
          {activeTab === 'store' ? null : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FEED_VIDEOS.map((video) => (
                <VideoCard
                  key={video.id}
                  videoUrl={video.videoUrl}
                  posterUrl={video.posterUrl}
                  views={video.views}
                  authorName={video.authorName}
                  authorHandle={video.authorHandle}
                  authorAvatar={video.authorAvatar}
                  description={video.description}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilesN3DetailPanel;