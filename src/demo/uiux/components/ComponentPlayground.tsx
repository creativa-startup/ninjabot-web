/**
 * @module ComponentPlayground
 * @description Taller de Componentes — entorno de inspección de doble columna.
 * La columna izquierda renderiza el lienzo de ajedrez sutil con el componente
 * real de Ninjabot bajo test, y la columna derecha contiene el mando de
 * calibración para sus props visuales (padding, radio, opacidad de borde).
 *
 * Responsabilidad Única: previsualizar y auditar de forma aislada los
 * componentes core del Sandbox (PostFeedCard, ProductCard, ControlCreatePost,
 * VideoCard) inyectando tokens visuales SOLO en su contenedor — sin afectar
 * el resto del Sandbox.
 */

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { PostFeedCard } from '../../../features/chats/PostFeedCard';
import { CHANNEL_CONFIG } from '../../../features/chats/channelConfig';
import type { SocialPost } from '../../../features/chats/types';
import { VideoCard } from '../../../components/ui/VideoCard';
import { ControlCreatePost } from '../../../components/ui/ControlCreatePost';
import { ProductCard } from '../../shop/ProductCard';
import type { TargetComponent } from '../mockPlaygroundData';
import { PLAYGROUND_MOCK_POST, PLAYGROUND_MOCK_PRODUCT, PLAYGROUND_VIDEO } from '../mockPlaygroundData';

export interface ComponentPlaygroundProps {
  /** Tema del shell maestro (dark/light) para adaptar superficies translúcidas */
  isDark?: boolean;
}

const COMPONENT_OPTIONS: Array<{ id: TargetComponent; label: string }> = [
  { id: 'post', label: 'Post Card' },
  { id: 'product', label: 'Product Card' },
  { id: 'create-post', label: 'Input Editor' },
  { id: 'video', label: 'Video Card' },
];

export const ComponentPlayground: React.FC<ComponentPlaygroundProps> = ({
  isDark = false,
}) => {
  const [selectedComp, setSelectedComp] = useState<TargetComponent>('post');

  /* Post normalizado: garantiza un channel soportado por CHANNEL_CONFIG
     (defensa runtime — si el mock llegara a tener un canal inválido, cae a
     instagram en lugar de crashear el render de PostFeedCard). */
  const safePost: SocialPost = {
    ...PLAYGROUND_MOCK_POST,
    channel: CHANNEL_CONFIG[PLAYGROUND_MOCK_POST.channel]
      ? PLAYGROUND_MOCK_POST.channel
      : ('instagram' as SocialPost['channel']),
  };

  /* Controles locales de calibración estética */
  const [compPadding, setCompPadding] = useState(24);
  const [compRadius, setCompRadius] = useState(24);
  const [compBorderOpacity, setCompBorderOpacity] = useState(5);

  const handleReset = () => {
    setCompPadding(24);
    setCompRadius(24);
    setCompBorderOpacity(5);
  };

  /* Superficies/tipografía adaptadas al tema */
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const panelBg = isDark ? 'bg-transparent border-white/10' : 'bg-white/80 border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.03)]';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const chipActive = isDark
    ? 'bg-white/15 text-white border-white/20'
    : 'bg-gray-900 text-white border-gray-900';
  const chipIdle = isDark
    ? 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
    : 'bg-gray-50 text-gray-600 border-black/5 hover:bg-gray-100';

  /* Lienzo de ajedrez sutil para auditar opacidades y transparencias */
  const checkerboard = {
    backgroundImage:
      'repeating-conic-gradient(' +
      (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') +
      ' 0% 25%, transparent 0% 50%)',
    backgroundSize: '32px 32px',
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* COLUMNA IZQUIERDA: Lienzo del Taller */}
      <div className="flex-1 flex flex-col space-y-3 min-w-0">
        <div className="flex justify-between items-center gap-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>
            Lienzo del Taller (Contraste Grid)
          </span>
          <span className="text-[10px] font-mono text-fuchsia-500 font-bold bg-fuchsia-500/5 px-2 py-0.5 rounded-full border border-fuchsia-500/10 flex-shrink-0">
            {compPadding}px · {compRadius}px · {compBorderOpacity}%
          </span>
        </div>

        {/* Fondo cuadriculado para auditar opacidades */}
        <div
          className={`flex-1 min-h-[340px] rounded-3xl border relative flex items-center justify-center p-8 overflow-y-auto transition-colors duration-500 ${
            isDark ? 'bg-neutral-900 border-white/10' : 'bg-neutral-100 border-black/5'
          }`}
          style={checkerboard}
        >
          {/* Contenedor auditado — recibe tokens visuales en tiempo real */}
          <div
            className="w-full max-w-sm transition-all duration-300 bg-white/80 backdrop-blur-md border border-solid"
            style={{
              padding: `${compPadding}px`,
              borderRadius: `${compRadius}px`,
              borderColor: `rgba(0, 0, 0, ${compBorderOpacity / 100})`,
            }}
          >
            {/* PREVISUALIZACIÓN REAL DE LOS COMPONENTES CORE */}
            {selectedComp === 'post' && (
              <PostFeedCard
                post={safePost}
                variant={isDark ? 'dark' : 'light'}
                isTimelineView={false}
                onReply={() => {}}
              />
            )}

            {selectedComp === 'product' && (
              <ProductCard
                product={PLAYGROUND_MOCK_PRODUCT}
                isDark={isDark}
                onAddToCart={() => {}}
              />
            )}

            {selectedComp === 'create-post' && (
              <ControlCreatePost
                isOpen
                onClose={() => {}}
                isShellDark={isDark}
                jazs={1200}
              />
            )}

            {selectedComp === 'video' && (
              <div className="mx-auto w-full max-w-[220px]">
                <VideoCard {...PLAYGROUND_VIDEO} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Inspectores del Mando */}
      <div className="w-full lg:w-80 flex flex-col space-y-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>
            Mando del Inspector
          </span>
          <button
            type="button"
            onClick={handleReset}
            title="Restablecer tokens"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-fuchsia-500 hover:underline"
          >
            <RotateCcw size={11} />
            Restablecer
          </button>
        </div>

        {/* Selector de Componente Activo */}
        <div className={`p-4 rounded-2xl border space-y-2 ${panelBg}`}>
          <label className={`text-[10px] font-semibold uppercase tracking-wider block ${textSecondary}`}>
            Componente
          </label>
          <div className="grid grid-cols-2 gap-2">
            {COMPONENT_OPTIONS.map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedComp(comp.id)}
                className={`py-2 px-3 text-center rounded-xl text-xs transition-all duration-200 border font-medium ${
                  selectedComp === comp.id ? chipActive : chipIdle
                }`}
              >
                {comp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders de Calibración */}
        <div className={`p-4 rounded-2xl border space-y-4 ${panelBg}`}>
          {/* Padding Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className={textPrimary}>Padding de Tarjeta</span>
              <span className="font-mono text-fuchsia-500 font-bold">{compPadding}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={32}
              value={compPadding}
              onChange={(e) => setCompPadding(parseInt(e.target.value, 10))}
              className="w-full accent-neutral-500 cursor-pointer"
              aria-label="Padding de tarjeta del componente auditado"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-medium">
              <span>Compacto (12px)</span>
              <span>Relajado (32px)</span>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className={textPrimary}>Radio de Esquina</span>
              <span className="font-mono text-fuchsia-500 font-bold">{compRadius}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={28}
              value={compRadius}
              onChange={(e) => setCompRadius(parseInt(e.target.value, 10))}
              className="w-full accent-neutral-500 cursor-pointer"
              aria-label="Radio de esquina del componente auditado"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-medium">
              <span>Recto (8px)</span>
              <span>Orgánico (28px)</span>
            </div>
          </div>

          {/* Border Opacity Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className={textPrimary}>Opacidad de Borde</span>
              <span className="font-mono text-fuchsia-500 font-bold">{compBorderOpacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              value={compBorderOpacity}
              onChange={(e) => setCompBorderOpacity(parseInt(e.target.value, 10))}
              className="w-full accent-neutral-500 cursor-pointer"
              aria-label="Opacidad del contorno del componente auditado"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-medium">
              <span>Sutil (0%)</span>
              <span>Definido (25%)</span>
            </div>
          </div>
        </div>

        {/* Nota de auditoría aislada */}
        <div className={`rounded-xl p-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
          <p className={`text-[10px] leading-relaxed ${textSecondary}`}>
            Auditoría aislada: los tokens se inyectan solo en el contenedor del componente
            seleccionado — no afectan el resto del Sandbox.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentPlayground;