import React, { useState } from 'react';
import { NinjabotLogo } from '../common/NinjabotLogo';
import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt';
import { useTypewriter } from '../../hooks/useTypewriter';

interface PowerActivationModalProps {
  /** Se invoca cuando el usuario completa la activación (notificaciones + PWA) */
  onActivated: () => void;
}

// ─── Mensajes de Ninjabot (entrenamiento VIP) ───
const INTRO_MESSAGE =
  'Hola, soy Ninjabot 🤖, tu empleado digital. Para desbloquear mis funciones superiores y notificaciones, debemos instalar mi núcleo en tu dispositivo.';

const GUIDE_IOS =
  'Ve a la parte inferior de tu pantalla, toca el ícono de compartir (cuadrado con flecha) y selecciona "Agregar a inicio".';

const GUIDE_ANDROID_DESKTOP =
  'Prueba primero arriba, en la barra de tu navegador. Haz clic en los 3 puntos (⋮), deslízate y selecciona "Instalar aplicación" o "Añadir a inicio".';

/**
 * Power Activation Modal — "Entrenamiento VIP de Ninjabot"
 *
 * Estética UX/UI Card:
 * - Fondo sutil (neutral-50/50), tarjeta translúcida con backdrop-blur-md.
 * - Bordes invisibles (border-black/5) y sombra ambiental desenfocada.
 * - Logo Ninjabot a color centrado (contraste perfecto sobre blanco).
 * - Botón toggle [↓ Descargar]: al presionarlo se desactiva y cambia a
 *   "Descargando..." con flecha animada, desplegando la segunda caja de texto.
 * - Flecha guía SVG centrada apuntando hacia arriba (barra del navegador).
 * - Leyenda centrada: "Descarga desde opciones de navegador".
 */
export const PowerActivationModal: React.FC<PowerActivationModalProps> = ({ onActivated }) => {
  const { isStandalone, isInstalled, platform } = usePwaInstallPrompt();
  const [guideStarted, setGuideStarted] = useState(false);

  // Texto del segundo mensaje según plataforma
  const guideMessage = platform === 'ios' ? GUIDE_IOS : GUIDE_ANDROID_DESKTOP;

  // Typewriter: el intro se escribe al montar; la guía se escribe al presionar el toggle
  const introType = useTypewriter(INTRO_MESSAGE, 24);
  const guideType = useTypewriter(guideStarted ? guideMessage : '', 18);

  // ─── Auto-avance: si ya corre instalado (standalone) o ya está instalado,
  // el modal se cierra automáticamente y el guardián revela el MainLayout ───
  React.useEffect(() => {
    if (isStandalone || isInstalled) {
      onActivated();
    }
  }, [isStandalone, isInstalled, onActivated]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50/50 font-sans select-none px-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-black/5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] px-8 py-12 flex flex-col items-center text-center relative">
        {/* ─── Flecha guía: centrada, apuntando hacia arriba (barra del navegador) ─── */}
        {guideStarted && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center animate-bounce">
              <svg className="w-9 h-9 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="M6 11l6-6 6 6" />
              </svg>
            </div>
            {/* Leyenda centrada */}
            <p className="mt-2 text-[11px] font-semibold text-neutral-600 tracking-wide">
              Descarga desde opciones de navegador
            </p>
          </div>
        )}

        {/* ─── Logo Ninjabot centrado (a color sobre fondo claro) ─── */}
        <div className={guideStarted ? 'mt-16 mb-5 flex items-center justify-center' : 'mb-5 flex items-center justify-center'}>
          <NinjabotLogo variant="color" size="xl" className="w-20 h-20 sm:w-24 sm:h-24" />
        </div>

        {/* ─── Burbuja de chat IA con Typewriter ─── */}
        <div className="w-full relative mb-8">
          <div className="bg-black/5 border border-black/5 rounded-2xl rounded-tl-sm px-5 py-4 text-left min-h-[88px]">
            <p className="text-neutral-800 text-sm sm:text-base leading-relaxed">
              {introType.displayedText}
              {introType.isTyping && <span className="typewriter-cursor" aria-hidden="true" />}
            </p>
          </div>

          {/* ─── Segundo mensaje de guía (aparece tras el toggle) ─── */}
          {guideStarted && (
            <div className="mt-3 bg-black/5 border border-black/5 rounded-2xl rounded-tl-sm px-5 py-4 text-left animate-slide-in-up">
              <p className="text-neutral-800 text-sm sm:text-base leading-relaxed">
                {guideType.displayedText}
                {guideType.isTyping && <span className="typewriter-cursor" aria-hidden="true" />}
              </p>
            </div>
          )}
        </div>

        {/* ─── Botón Toggle [↓ Descargar] — sin borde duro, sombra ambiental ─── */}
        <button
          onClick={() => setGuideStarted(true)}
          disabled={guideStarted}
          className="group relative w-full py-4 px-8 rounded-2xl text-base sm:text-lg font-extrabold transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 hover:-translate-y-0.5 shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2.5">
            {guideStarted ? (
              <>
                {/* Flecha descargando animada */}
                <svg className="w-5 h-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M18 13l-6 6-6-6" />
                </svg>
                Descargando...
              </>
            ) : (
              <>
                <span className="text-xl" aria-hidden="true">↓</span>
                Descargar
              </>
            )}
          </span>
        </button>

        {/* ─── Subtítulo de seguridad ─── */}
        <p className="mt-6 text-[11px] font-medium text-neutral-400 tracking-wide">
          Entrenamiento VIP — sigue las instrucciones y Ninjabot te espera dentro
        </p>
      </div>
    </div>
  );
};