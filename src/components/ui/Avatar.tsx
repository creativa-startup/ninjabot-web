import React from 'react';

/**
 * Avatar atómico universal — Capa 2: Componentes Atómicos.
 *
 * Centraliza el diseño del Avatar de usuario en la UI con 4 tamaños
 * estándar que gobiernan toda la aplicación:
 *   - 'sm' → w-7 h-7 text-xs      (micro-UI, compartidos, estados rápidos)
 *   - 'md' → w-11 h-11 text-base  (tarjetas y chats — default)
 *   - 'xl' → w-14 h-14 text-lg border-2 (historias / Stories — Social Commerce)
 *   - 'lg' → w-20 h-20 text-2xl border-2 (perfil y directorio Contactos N2)
 *
 * Materialidad Capa 1:
 *   - Fondo degradado gris neutro (light) / azul-noche profundo (dark).
 *   - Borde translúcido enterprise (border-black/5 dark:border-white/10).
 *   - Sombra ambiental suave (shadow-sm) — nunca shadow-md/lg/xl.
 *
 * Comportamiento:
 *   - Si existe `src`, renderiza <img> con object-cover y referrerPolicy
 *     no-referrer para evitar bloqueos de hotlink en proveedores externos.
 *   - Si NO existe `src`, renderiza `fallback` (iniciales) centrado usando
 *     el token tipográfico Capa 1 `text-secondary` + font-medium + uppercase.
 */
export type AvatarSize = 'sm' | 'md' | 'xl' | 'lg';

export interface AvatarProps {
  /** URL de la imagen del usuario */
  src?: string;
  /** Texto a mostrar si no hay imagen (ej. "JD") */
  fallback: string;
  /** Tamaño estándar del avatar. Default: 'md' */
  size?: AvatarSize;
  /** Clases adicionales para extender estilos contextuales */
  className?: string;
}

/** Diccionario de tamaños estándar → clases Tailwind */
const SIZES: Record<AvatarSize, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg border-2',
  lg: 'w-20 h-20 text-2xl border-2',
};

/** Estilos base — Materialidad Capa 1 (superficie circular con degradado) */
const BASE_CLASSES =
  'flex items-center justify-center rounded-full shrink-0 overflow-hidden ' +
  'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1a1a2e] dark:to-[#0a0a0f] ' +
  'border border-black/5 dark:border-white/10 shadow-sm';

export const Avatar: React.FC<AvatarProps> = ({
  src,
  fallback,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = SIZES[size];

  return (
    <div
      className={`${BASE_CLASSES} ${sizeClasses} ${className}`}
      aria-label={`Avatar de ${fallback}`}
      role="img"
    >
      {src ? (
        <img
          src={src}
          alt={fallback}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-medium text-secondary uppercase select-none">
          {fallback}
        </span>
      )}
    </div>
  );
};

export default Avatar;