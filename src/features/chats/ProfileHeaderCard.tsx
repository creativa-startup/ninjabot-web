/**
 * @module ProfileHeaderCard
 * @description Cabecera de perfil reutilizable (Presenter puro).
 * Sirve como cabecera en el panel N3 (Perfil) y como tarjeta rica
 * embebible dentro de un post en el Timeline (N2) cuando un usuario
 * comparte un perfil.
 *
 * Sistema de Diseño — Capa 1 (Tokens y Superficies):
 * - Superficie transparente: el contenedor NO aplica fondo propio — hereda
 *   el fondo del panel padre (N3) para integración visual sin cajas.
 * - Jerarquía tipográfica: text-title (nombre), text-meta (@handle/ubicación),
 *   text-body (bio + stats).
 * - Microinteracciones: active-press (compresión táctil en botones de acción).
 * - Regla estricta: sin clases rounded-* en contenedores principales
 *   (bordes rectos 0px vía rounded-none global). El avatar es la única
 *   excepción atómica (círculo).
 *
 * Estructura:
 *   1. Banner A Sangre (h-40 en N3 / h-32 embedded) — object-cover sin padding.
 *      Solo se renderiza si profile.bannerUrl existe — sin banner no hay
 *      elemento extra ni espacio vacío en la parte superior.
 *   2. Avatar superpuesto al banner (con banner) o alineado al flujo
 *      (sin banner) + Nombre/@handle a su derecha (con punto verde online).
 *   3. Descripción pequeña (bio) debajo de la portada.
 *   4. Fila de seguidores con 2 botones de acción: Ninjazs y Compartir.
 */

import React from 'react';
import { Heart, Share } from 'lucide-react';

export interface ProfileHeaderCardProfile {
  id: string;
  name?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  followers?: number;
  location?: string;
  website?: string;
  isOnline?: boolean;
}

export interface ProfileHeaderCardProps {
  profile: ProfileHeaderCardProfile;
  /** true = dentro de un post (banner h-32 compacto); false = cabecera N3 (h-40) */
  isEmbedded?: boolean;
  isDark?: boolean;
  /** true = ya se sigue al perfil */
  isFollowing?: boolean;
  onFollow?: () => void;
  onShare?: () => void;
  onAvatarClick?: () => void;
}

/** Formatea números grandes (1234 → "1.2K") */
const formatCount = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

/** Renderiza el avatar: imagen si existe, iniciales como fallback */
const Avatar: React.FC<{
  profile: ProfileHeaderCardProfile;
  onAvatarClick?: () => void;
}> = ({ profile, onAvatarClick }) => {
  const initial = (profile.name || 'N').trim().charAt(0).toUpperCase() || 'N';

  return (
    <div className="relative shrink-0 cursor-pointer" onClick={onAvatarClick}>
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt={profile.name || 'Avatar'}
          className={`w-20 h-20 rounded-full object-cover border-2 border-white dark:border-[#151515] shadow-sm select-none pointer-events-none`}
        />
      ) : (
        <div
          className={`w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl font-bold border-2 border-white dark:border-[#151515] shadow-sm select-none pointer-events-none`}
        >
          {initial}
        </div>
      )}

      {/* Punto verde online */}
      {profile.isOnline && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 bg-emerald-500/90 border-white dark:border-[#151515]`}
        />
      )}
    </div>
  );
};

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  isEmbedded = false,
  isDark = false,
  isFollowing = false,
  onFollow,
  onShare,
  onAvatarClick,
}) => {
  const displayName = profile.name || 'Ninjat';
  const handle = profile.handle ? `@${profile.handle.replace(/^@/, '')}` : '@sin-handle';
  const followers = profile.followers ?? 0;
  const bannerHeight = isEmbedded ? 'h-32' : 'h-40';

  return (
    <div
      className={`relative flex flex-col w-full bg-transparent border-0 overflow-hidden`}
    >
      {/* ═══ 1. Banner A Sangre (Full-Bleed) — solo si hay banner ═══ */}
      {profile.bannerUrl && (
        <img
          src={profile.bannerUrl}
          alt=""
          loading="lazy"
          className={`w-full ${bannerHeight} object-cover select-none pointer-events-none`}
        />
      )}

      {/* ═══ 2. Avatar superpuesto (con banner) o alineado (sin banner) + Nombre/@handle ═══ */}
      <div className={`flex items-end gap-3 px-4 ${profile.bannerUrl ? '-mt-12' : 'mt-4'}`}>
        <Avatar
          profile={profile}
          onAvatarClick={onAvatarClick}
        />

        <div className="flex-1 min-w-0 pb-1.5">
          <h2 className="text-title text-lg truncate">{displayName}</h2>
          <p className="text-meta truncate">{handle}</p>
        </div>
      </div>

      {/* ═══ 3. Contenido inferior: bio + seguidores/acciones ═══ */}
      <div className="px-4 pb-4 mt-3">
        {/* Descripción pequeña */}
        {profile.bio && (
          <p className="text-body text-sm leading-relaxed line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Fila: número de seguidores + botones Seguir / Compartir */}
        <div className="flex items-center justify-between gap-3 mt-3">
          {/* Seguidores */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-body text-sm font-medium">{formatCount(followers)}</span>
            <span className="text-meta truncate">Seguidores</span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Ninjazs (like al perfil) */}
            <button
              type="button"
              onClick={onFollow}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide active-press border transition-colors ${
                isFollowing
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : isDark
                    ? 'bg-fuchsia-500 border-fuchsia-500 text-white hover:bg-fuchsia-400 hover:border-fuchsia-400'
                    : 'bg-fuchsia-600 border-fuchsia-600 text-white hover:bg-fuchsia-500 hover:border-fuchsia-500'
              }`}
              title={isFollowing ? 'Quitar Ninjazs' : 'Ninjazs perfil'}
            >
              <Heart
                size={14}
                strokeWidth={2}
                className={isFollowing ? 'fill-current' : ''}
              />
              Ninjazs
            </button>

            {/* Compartir */}
            <button
              type="button"
              onClick={onShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide active-press border transition-colors ${
                isDark
                  ? 'border-white/10 text-white/70 hover:text-white hover:border-white/30'
                  : 'border-black/10 text-gray-600 hover:text-gray-900 hover:border-black/30'
              }`}
              title="Compartir perfil"
            >
              <Share size={14} strokeWidth={1.5} />
              Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderCard;