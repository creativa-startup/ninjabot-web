/**
 * @module PublicNinjatLayout
 * @description Cadenero de interceptación para el enrutamiento público /@handle
 * bajo el modelo estricto de "Club Privado".
 *
 * Regla de oro:
 *   - Ningún usuario NO autenticado puede ver la información del perfil.
 *   - Si `isLoggedIn === false`, bloquea inmediatamente sin renderizar nada
 *     ni hacer fetch a Supabase, y redirige a /auth?returnTo=/@handle.
 *   - Tras autenticarse (AuthScreen), el usuario regresa al destino original
 *     (returnTo) una vez superado el PowerAppGuard.
 */

import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export interface PublicNinjatLayoutProps {
  /** Estado de sesión global del usuario (desde App.tsx) */
  isLoggedIn: boolean;
  /** Contenido protegido (MainLayout envuelto en PowerAppGuard) */
  children: React.ReactNode;
}

export const PublicNinjatLayout: React.FC<PublicNinjatLayoutProps> = ({
  isLoggedIn,
  children,
}) => {
  const { handle } = useParams<{ handle: string }>();

  // ─── El Cadenero: sin sesión → bloqueo inmediato y redirección ───
  // No se intenta renderizar el panel ni hacer fetch a Supabase.
  if (!isLoggedIn) {
    const returnPath = handle ? `/@${handle}` : '/app';
    const redirectTarget = `/auth?returnTo=${encodeURIComponent(returnPath)}`;
    return <Navigate to={redirectTarget} replace />;
  }

  // ─── Miembro del Club: se revela el contenido protegido ───
  return <>{children}</>;
};

export default PublicNinjatLayout;