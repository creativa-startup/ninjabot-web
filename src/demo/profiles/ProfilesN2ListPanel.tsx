/**
 * @module ProfilesN2ListPanel
 * @description Muro vertical del creador — "Mi Timeline" (Panel N2).
 * Rediseño: actúa como un muro (wall) que muestra tanto el texto
 * (microblogging) como la imagen (si el post la tiene). Todo maquetado
 * localmente en el Sandbox con gradientes CSS (sin assets externos ni red).
 *
 * DRY (Wrapper del Perfil):
 * - El header maestro (ControlProfile) ahora vive en el LayoutDemo y es
 *   compartido por Timeline, Contactos y Configuración. Este panel N2 ya NO
 *   renderiza su propio ControlProfile — comienza directamente desde el
 *   ControlCreatePost y el muro/tabs (contexto provisto por el Wrapper).
 * - El botón "+" del header maestro abre este ControlCreatePost mediante el
 *   token `createPostToken` (efecto colateral disparado por prop).
 *
 * Tabs del Perfil (Solo Móvil):
 *   - Debajo del Header N2 se renderiza ControlProfileTabs (Feed | Tienda)
 *     ÚNICAMENTE en viewport móvil (<768px) para que el body del perfil sea
 *     visible sin depender de la navegación N2 → N3.
 *   - En desktop los tabs NO se muestran en el N2: el N3 a la derecha ya
 *     contiene el perfil completo con sus propios tabs (Header + Body).
 *   - Tab "Feed": muro actual de Jazs (PostFeedCard).
 *   - Tab "Tienda": ProfileStoreGrid con catálogo Meta Commerce (igual que N3).
 *
 * Encapsulación: componente puro — solo recibe props y renderiza. No realiza
 * llamadas a BD ni conoce el módulo de Chats.
 *
 * Layout Decoupling: reutiliza el componente real de producción PostFeedCard
 * (src/features/chats/) con la variante claro/oscuro según el tema del shell.
 *
 * Estética Premium UX/UI Card: fondos translúcidos, bordes invisibles
 * (border-black/5 claro / border-white/10 oscuro), sin cajas grises.
 */

import React, { useState, useRef, useEffect } from 'react';
import { PenSquare } from 'lucide-react';
import type { SocialPost } from '../../features/chats/types';
import { PostFeedCard } from '../../features/chats/PostFeedCard';
import { ControlCreatePost } from '../../components/ui/ControlCreatePost';
import { ControlProfileTabs } from '../ControlProfileTabs';
import { ProfileStoreGrid, type ProfileStoreProduct } from '../ProfileStoreGrid';
import { useIsMobile } from '../../hooks/useIsMobile';

export interface ProfilesN2ListPanelProps {
  /** Callback al seleccionar un perfil → dispara navegación N2 → N3 */
  onSelectProfile: (profileId: string) => void;
  /** Token que se incrementa cuando el "+" del header maestro pide abrir el editor */
  createPostToken?: number;
  /** Token que se incrementa cuando se cambia de vista → cierra el editor */
  closeCreatePostToken?: number;
  /** Id del perfil activo (para resaltar la tarjeta seleccionada) */
  selectedId?: string | null;
  /** Tema del shell maestro (dark/light) para adaptar colores base */
  isShellDark?: boolean;
}

/* ─── Datos locales simulados de los Jazs propios (sin BD) ─── */
interface JazItem {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  reach: string;
  /** Indica si el Jaz incluye una imagen (solo algunos posts) */
  hasImage?: boolean;
  /** Variante de gradiente local que simula la fotografía (wireframe) */
  imageGradient?: string;
}

const MY_JAZS: JazItem[] = [
  {
    id: 'jaz-1',
    content:
      'Hoy lanzamos la nueva campaña de contenido para Instagram. Estamos probando reels de 15 segundos con storytelling directo. Los primeros resultados muestran un aumento del 40% en interacciones comparado con el mes pasado. 🚀',
    timestamp: 'Hace 2 horas',
    likes: 148,
    comments: 23,
    reach: '12.4k',
    hasImage: true,
    imageGradient: 'from-fuchsia-500 via-purple-500 to-indigo-600',
  },
  {
    id: 'jaz-2',
    content:
      'Reflexión de la semana: la consistencia vence al talento. Llevo 90 días publicando a diario y el algoritmo finalmente está premiando el esfuerzo. Cada Jaz cuenta una parte de la historia de la marca.',
    timestamp: 'Ayer · 8:30 PM',
    likes: 96,
    comments: 12,
    reach: '8.1k',
  },
  {
    id: 'jaz-3',
    content:
      'Nuevo hito alcanzado: 1,000 seguidores en comunidad. Esto no sería posible sin cada persona que interactúa con mi contenido. El siguiente objetivo es duplicar el alcance mensual a 15k. ¡Vamos por más! 🎯',
    timestamp: 'Ayer · 11:00 AM',
    likes: 210,
    comments: 34,
    reach: '15.7k',
    hasImage: true,
    imageGradient: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    id: 'jaz-4',
    content:
      'Backstage del nuevo producto: pruebas de concepto en marcha. El equipo está iterando rápido y el feedback de la comunidad ha sido clave para ajustar el enfoque. Pronto compartiré más detalles exclusivos.',
    timestamp: 'Hace 3 días',
    likes: 67,
    comments: 9,
    reach: '5.2k',
    hasImage: true,
    imageGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
  },
];

/* ─── Catálogo de productos (Social Commerce — contrato Meta Commerce API) ─── */
const MOCK_STORE_PRODUCTS: ProfileStoreProduct[] = [
  {
    id: 'prod-1',
    title: 'Plantilla de Reels',
    price: '29.99 USD',
    availability: 'in stock',
    image_url: null,
  },
  {
    id: 'prod-2',
    title: 'Guía Growth Hacking',
    price: '19.99 USD',
    availability: 'in stock',
    image_url: null,
  },
  {
    id: 'prod-3',
    title: 'Curso Embudos IA',
    price: '49.99 USD',
    availability: 'in stock',
    image_url: null,
  },
  {
    id: 'prod-4',
    title: 'Pack Mockups',
    price: '9.99 USD',
    availability: 'in stock',
    image_url: null,
  },
  {
    id: 'prod-5',
    title: 'Mentoría 1:1',
    price: '79.99 USD',
    availability: 'limited',
    image_url: null,
  },
  {
    id: 'prod-6',
    title: 'Kit Branding',
    price: '39.99 USD',
    availability: 'out of stock',
    image_url: null,
  },
];

/* ─── Mapeo de Jazs locales → SocialPost (Producción) ───
   Sin media_url: el Sandbox no depende de imágenes remotas (picsum.photos).
   El PostFeedCard con isTimelineView={false} muestra el texto siempre visible. */
const toSocialPost = (jaz: JazItem): SocialPost => ({
  id: jaz.id,
  authorName: 'Mi Negocio',
  authorHandle: '@mi_negocio',
  authorAvatar: 'N',
  content: jaz.content,
  timestamp: jaz.timestamp,
  channel: 'instagram',
  metrics: { comments: jaz.comments, likes: jaz.likes, shares: 0 },
  isOnline: true,
});

export const ProfilesN2ListPanel: React.FC<ProfilesN2ListPanelProps> = ({
  onSelectProfile,
  createPostToken = 0,
  closeCreatePostToken = 0,
  selectedId = null,
  isShellDark = false,
}) => {
  /* Estado local del Sandbox — despliega el ControlCreatePost al hacer clic en + */
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  /* Tab activo del perfil — solo se usa en móvil (Feed | Tienda) */
  const [activeTab, setActiveTab] = useState<'feed' | 'store'>('feed');

  /* Referencia al top del panel — para auto-scroll del FAB en móvil */
  const topRef = useRef<HTMLDivElement>(null);

  /* Detectar viewport móvil — FAB y tabs solo visibles en <768px */
  const isMobile = useIsMobile();

  /* Abre el ControlCreatePost y desplaza la vista suavemente hacia arriba */
  const handleFabClick = () => {
    setIsPublishOpen(true);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  /* ─── Efecto colateral: el "+" del header maestro (Wrapper) abre el editor ─── */
  useEffect(() => {
    if (createPostToken === 0) return;
    handleFabClick();
  }, [createPostToken]);

  /* ─── Cierre defensivo: al cambiar de vista se cierra el editor ─── */
  useEffect(() => {
    if (closeCreatePostToken === 0) return;
    setIsPublishOpen(false);
  }, [closeCreatePostToken]);

  /* ─── Defensivo: al salir del viewport móvil se resetea el tab a Feed.
     En desktop los tabs NO existen en el N2 (el N3 tiene los suyos), así que
     el muro Feed siempre debe ser el contenido del N2 en pantallas ≥768px. ─── */
  useEffect(() => {
    if (!isMobile) setActiveTab('feed');
  }, [isMobile]);

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${
        isShellDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
      }`}
    >
      {/* Ancla del top — justo encima del contenido para el auto-scroll del FAB */}
      <div ref={topRef} />

      {/* ─── ControlCreatePost (Sandbox) — se despliega justo debajo del header maestro ─── */}
      <ControlCreatePost
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onSubmit={(payload) => console.log('Post mockeado:', payload)}
        isShellDark={isShellDark}
      />

      {/* ─── Tabs del Perfil (Solo Móvil) — Feed | Tienda ─── */}
      {isMobile && (
        <div className="flex-shrink-0">
          <ControlProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDark={isShellDark}
          />
        </div>
      )}

      {/* ─── Cuerpo Scrollable: Muro (Feed) ↔ Grid (Tienda) ─── */}
      <div className={`flex-1 overflow-y-auto flex flex-col bg-transparent`}>
        {isMobile && activeTab === 'store' ? (
          /* ─── Tab Tienda: cuadrícula de productos (Meta Commerce API) ─── */
          <ProfileStoreGrid
            products={MOCK_STORE_PRODUCTS}
            isDark={isShellDark}
            onProductClick={(product) => {
              // Punto de extensión: abrir detalle de producto N4 en el futuro.
              console.log('[Social Commerce · N4 futuro] Producto seleccionado:', product);
            }}
          />
        ) : (
          /* ─── Tab Feed: muro vertical de Jazs (texto + imagen) ─── */
          <>
            {MY_JAZS.map((jaz) => {
              const isSelected = jaz.id === selectedId;
              const post = toSocialPost(jaz);
              return (
                <div
                  key={jaz.id}
                  className={`flex-shrink-0 px-3 pt-3 transition-colors duration-300 ${
                    isSelected
                      ? isShellDark
                        ? 'bg-white/[0.04]'
                        : 'bg-fuchsia-500/[0.04]'
                      : ''
                  }`}
                >
                  <PostFeedCard
                    post={post}
                    variant={isShellDark ? 'dark' : 'light'}
                    isTimelineView={false}
                    onReply={(p) => onSelectProfile(p.id)}
                    onAuthorClick={(p) => onSelectProfile(p.id)}
                  />
                </div>
              );
            })}

            {/* Spacer inferior para respiración del feed */}
            <span className="flex-shrink-0 h-4 bg-transparent" />
          </>
        )}
      </div>

      {/* ─── FAB — Botón Flotante de Publicación (solo móvil) ─── */}
      {isMobile && (
        <button
          type="button"
          onClick={handleFabClick}
          title="Crear nuevo Jaz"
          className="absolute bottom-5 right-5 z-20 w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-white/20 transition-all duration-300 active:scale-90 hover:scale-105"
        >
          <PenSquare size={22} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
};

export default ProfilesN2ListPanel;