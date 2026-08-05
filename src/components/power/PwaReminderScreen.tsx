import React from 'react';
import { NinjabotLogo } from '../common/NinjabotLogo';

interface PwaReminderScreenProps {
  /** Continúa por el navegador tradicional (bypass transitorio) */
  onContinue: () => void;
}

/**
 * Pantalla de Recordatorio PWA — "¡Hola de nuevo!"
 *
 * Se muestra cuando un usuario que YA instaló la Power App
 * (pwa_installed = true en Supabase) intenta acceder desde un
 * navegador tradicional (isStandalone = false).
 *
 * Estética UX/UI Card: fondo sutil, tarjeta translúcida con backdrop-blur-md,
 * borde invisible (border-black/5) y sombra ambiental desenfocada.
 */
export const PwaReminderScreen: React.FC<PwaReminderScreenProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50/50 font-sans select-none px-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-black/5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] px-8 py-12 flex flex-col items-center text-center">
        {/* ─── Logo Ninjabot centrado (a color sobre fondo claro) ─── */}
        <div className="mb-6 flex items-center justify-center">
          <NinjabotLogo variant="color" size="xl" className="w-20 h-20 sm:w-24 sm:h-24" />
        </div>

        {/* ─── Título ─── */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-3">
          ¡Hola de nuevo!
        </h1>

        {/* ─── Cuerpo ─── */}
        <p className="text-sm text-neutral-600 leading-relaxed mb-10 max-w-sm">
          Recuerda que ya estoy instalado en tu dispositivo. Para una experiencia
          más rápida y recibir notificaciones, búscame en tus apps como{' '}
          <span className="font-semibold text-neutral-900">Ninjabot</span> y ábreme desde ahí.
        </p>

        {/* ─── Botón fantasma (outline translúcido) ─── */}
        <button
          onClick={onContinue}
          className="w-full bg-white/60 backdrop-blur-md border border-black/5 text-neutral-900 font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-200 hover:bg-white hover:-translate-y-0.5 shadow-[0_20px_40px_rgba(0,0,0,0.03)] active:scale-[0.98] cursor-pointer"
        >
          Continuar por aquí en el navegador
        </button>
      </div>
    </div>
  );
};