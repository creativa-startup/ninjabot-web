import { useCallback, useEffect, useState } from 'react';
import { getPwaInstalada, marcarPwaInstalada } from '../services/supabase';

/**
 * Tipado del evento beforeinstallprompt (no incluido en lib.dom estándar).
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY = 'ninjabot-power-activated';

/**
 * Tipo de plataforma detectada para la guía de instalación.
 * - 'ios': iPhone/iPad/iPod (Safari) — usa "Agregar a Inicio".
 * - 'android': Android (Chrome) — usa "Instalar aplicación" en los 3 puntos.
 * - 'desktop': Chrome/Edge de escritorio — usa "Instalar aplicación" en la barra.
 */
export type NinjabotPlatform = 'ios' | 'android' | 'desktop';

/**
 * Detecta la plataforma del dispositivo/navegador vía userAgent.
 * Incluye iPadOS 13+ que se reporta como Mac pero tiene touch.
 */
function detectPlatform(): NinjabotPlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isiPadOSDesktop = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (isIOSDevice || isiPadOSDesktop) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

/**
 * Detecta si es iOS (compatibilidad con consumidores existentes).
 */
function detectIOS(): boolean {
  return detectPlatform() === 'ios';
}

/**
 * Hook "Power App": detecta la PWA y expone el prompt de instalación nativo.
 *
 * - Chrome/Edge/Android: captura `beforeinstallprompt` y expone `promptInstall()`
 *   que dispara el diálogo nativo del SO sin fricción.
 * - iOS/Safari: detecta `isIOS` para que la UI muestre el overlay de
 *   "Agregar a Inicio" (Apple no soporta el evento de instalación).
 * - `isStandalone`: true si la app corre instalada (display-mode: standalone),
 *   lo que permite el auto-avance sin clics adicionales.
 * - `powerActivated`: persiste en localStorage para omitir el modal en
 *   futuras visitas una vez concedidos los permisos.
 */
export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS] = useState<boolean>(() => detectIOS());
  const [platform] = useState<NinjabotPlatform>(() => detectPlatform());
  const [pwaInstaladaEnDb, setPwaInstaladaEnDb] = useState<boolean>(false);
  const [powerActivated, setPowerActivated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // ─── Leer el flag pwa_installed de Supabase al montar ───
  useEffect(() => {
    getPwaInstalada()
      .then((instalada) => setPwaInstaladaEnDb(instalada))
      .catch((err) => console.warn('[usePwaInstallPrompt] Error leyendo pwa_installed:', err));
  }, []);

  // ─── Detectar ejecución standalone (PWA instalada / abierta desde inicio) ───
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsStandalone(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ─── Capturar el evento de instalación PWA (Chrome/Edge/Android) ───
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  // ─── Instalación completada (evento appinstalled) → auto-avance ───
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      // Si la instalación se completó, el poder queda activado automáticamente
      setPowerActivated(true);
      // Persistencia en Supabase: el usuario ya instaló la Power App
      setPwaInstaladaEnDb(true);
      marcarPwaInstalada().catch((err) =>
        console.warn('[usePwaInstallPrompt] Error marcando pwa_installed:', err)
      );
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // localStorage no disponible
      }
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  /**
   * Dispara el prompt de instalación nativo del SO inmediatamente.
   * Retorna true si el usuario aceptó la instalación.
   * En navegadores sin evento (iOS), retorna false y la UI usa el overlay.
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome === 'accepted';
    }
    return isStandalone || isInstalled;
  }, [deferredPrompt, isStandalone, isInstalled]);

  /** Marca el poder como activado (persistente) */
  const activatePower = useCallback(() => {
    setPowerActivated(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage no disponible (modo privado estricto)
    }
  }, []);

  return {
    deferredPrompt,
    isStandalone,
    isInstalled,
    isIOS,
    platform,
    pwaInstaladaEnDb,
    powerActivated,
    promptInstall,
    activatePower,
  };
}
