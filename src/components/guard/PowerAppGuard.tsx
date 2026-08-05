import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PowerActivationModal } from '../power/PowerActivationModal';
import { PwaReminderScreen } from '../power/PwaReminderScreen';
import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt';

interface PowerAppGuardProps {
  /** Indica si el usuario tiene una sesión activa */
  isLoggedIn: boolean;
  /** MainLayout (N1-N4) o cualquier contenido privado protegido */
  children: React.ReactNode;
}

const WELCOME_NOTIFICATION_KEY = 'ninjabot-welcome-notification-sent';

/**
 * Guardián de Activación "Power App".
 *
 * Árbol de decisiones:
 * A. isStandalone === true || bypassReminder === true → revela el MainLayout.
 * B. isStandalone === false && pwa_installed === true (Supabase) →
 *    muestra PwaReminderScreen; el botón activa el bypass transitorio.
 * C. isStandalone === false && pwa_installed === false →
 *    muestra PowerActivationModal (proceso de instalación/gamificación).
 *
 * Regla estricta: el MainLayout (N1-N4) NO se monta hasta que el poder
 * esté activo. Todo este enrutamiento visual se resuelve aquí.
 */
export const PowerAppGuard: React.FC<PowerAppGuardProps> = ({ isLoggedIn, children }) => {
  const { pwaInstaladaEnDb, isStandalone } = usePwaInstallPrompt();

  // Bypass transitorio: solo en memoria. Al recargar en navegador tradicional
  // el recordatorio vuelve a mostrarse.
  const [bypassReminder, setBypassReminder] = useState<boolean>(false);

  // ─── Condición A: la app corre instalada O el usuario continuó por el navegador ───
  const canEnterApp = isStandalone || bypassReminder;

  // ─── Notificación local de bienvenida (una sola vez, al entrar a la app) ───
  useEffect(() => {
    if (!canEnterApp) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    let alreadySent = false;
    try {
      alreadySent = localStorage.getItem(WELCOME_NOTIFICATION_KEY) === 'true';
    } catch {
      alreadySent = false;
    }
    if (alreadySent) return;

    try {
      const notification = new Notification('🔥 Ninjabot encendido', {
        body: '¡Bienvenido a la Power App! Tu empleado digital 24/7 está listo.',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      localStorage.setItem(WELCOME_NOTIFICATION_KEY, 'true');
    } catch (err) {
      console.warn('[PowerAppGuard] No se pudo enviar la notificación de bienvenida:', err);
    }
  }, [canEnterApp]);

  // ─── Protección de autenticación ───
  // Preserva la ruta destino en returnTo para que, tras autenticarse,
  // el AuthScreen redirija al usuario a la página original (ej. /@handle).
  if (!isLoggedIn) {
    const currentPath = window.location.pathname + window.location.search;
    const redirectTarget =
      currentPath && currentPath !== '/auth'
        ? `/auth?returnTo=${encodeURIComponent(currentPath)}`
        : '/auth';
    return <Navigate to={redirectTarget} replace />;
  }

  // ─── A) Usuario en la app instalada, o decidió continuar por el navegador ───
  if (canEnterApp) {
    return <>{children}</>;
  }

  // ─── B) Instaló la PWA (Supabase) pero accedió desde navegador tradicional ───
  if (pwaInstaladaEnDb) {
    return <PwaReminderScreen onContinue={() => setBypassReminder(true)} />;
  }

  // ─── C) Nunca instaló → proceso de activación/gamificación ───
  // Si `isInstalled` se vuelve true (evento appinstalled), el modal se
  // auto-cierra vía su propio useEffect y el guardián lo revela en el re-render.
  return (
    <PowerActivationModal
      onActivated={() => {
        setBypassReminder(true);
      }}
    />
  );
};