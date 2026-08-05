/**
 * @module GlobalTokensInspector
 * @description Controles de Capa 1 (Tokens Globales) del Estudio del Sistema de
 * Diseño. Mutan interactivamente las variables CSS del tag raíz:
 *
 *   --card-padding          → Densidad y Espaciado (16px Compacto → 32px Relajado)
 *   --glass-blur            → Materialidad y Superficie (4px Sutil → 20px Frosted)
 *   --text-secondary-weight → Contraste Tipográfico (400 Regular → 500 Medium)
 *   --accent-color          → Color de Acento Temático (botones activos)
 *
 * Incluye una tarjeta de verificación de consistencia en vivo que consume los
 * tokens inyectados. Componente puro: solo usa props (isDark) y estado local.
 */

import React, { useState } from 'react';
import { Check } from 'lucide-react';

export interface GlobalTokensInspectorProps {
  /** Tema del shell maestro (dark/light) para adaptar superficies translúcidas */
  isDark?: boolean;
}

const ACCENT_OPTIONS = [
  { hex: '#e056fd', name: 'Ninjabot Rosa' },
  { hex: '#25D366', name: 'WhatsApp' },
  { hex: '#111827', name: 'Industrial B/N' },
];

export const GlobalTokensInspector: React.FC<GlobalTokensInspectorProps> = ({
  isDark = false,
}) => {
  const [padding, setPadding] = useState(24);
  const [blur, setBlur] = useState(12);
  const [fontWeight, setFontWeight] = useState(400);
  const [accent, setAccent] = useState('#e056fd');

  const updateCSSVariable = (variable: string, value: string) => {
    document.documentElement.style.setProperty(variable, value);
  };

  const handlePaddingChange = (val: number) => {
    setPadding(val);
    updateCSSVariable('--card-padding', `${val}px`);
  };

  const handleBlurChange = (val: number) => {
    setBlur(val);
    updateCSSVariable('--glass-blur', `${val}px`);
  };

  const handleWeightToggle = () => {
    const nextWeight = fontWeight === 400 ? 500 : 400;
    setFontWeight(nextWeight);
    updateCSSVariable('--text-secondary-weight', String(nextWeight));
  };

  const handleAccentChange = (color: string) => {
    setAccent(color);
    updateCSSVariable('--accent-color', color);
  };

  /* Superficies y textos según tema del shell */
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const controlBg = isDark ? 'bg-white/5' : 'bg-white/80';
  const controlBorder = isDark ? 'border-white/10' : 'border-black/5';
  const chipIdle = isDark
    ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
    : 'bg-gray-50 border-black/5 text-gray-600 hover:bg-white';

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      {/* 1. Control de Densidad */}
      <div className={`p-5 rounded-2xl border space-y-3 ${controlBg} ${controlBorder}`}>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-semibold ${textPrimary}`}>Densidad (Padding de Tarjetas)</span>
          <span className="text-[11px] font-mono text-fuchsia-500 font-bold">{padding}px</span>
        </div>
        <input
          type="range"
          min={16}
          max={32}
          value={padding}
          onChange={(e) => handlePaddingChange(parseInt(e.target.value, 10))}
          className="w-full accent-fuchsia-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
          <span>Compacto (16px)</span>
          <span>Cómodo (24px)</span>
          <span>Relajado (32px)</span>
        </div>
      </div>

      {/* 2. Control de Materialidad */}
      <div className={`p-5 rounded-2xl border space-y-3 ${controlBg} ${controlBorder}`}>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-semibold ${textPrimary}`}>Materialidad (Glassmorphic Blur)</span>
          <span className="text-[11px] font-mono text-fuchsia-500 font-bold">{blur}px</span>
        </div>
        <input
          type="range"
          min={4}
          max={20}
          value={blur}
          onChange={(e) => handleBlurChange(parseInt(e.target.value, 10))}
          className="w-full accent-fuchsia-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
          <span>Sutil (4px)</span>
          <span>Brillante (12px)</span>
          <span>Frosted (20px)</span>
        </div>
      </div>

      {/* 3. Contraste de Texto Secundario */}
      <div className={`p-5 rounded-2xl border flex items-center justify-between ${controlBg} ${controlBorder}`}>
        <div className="space-y-0.5">
          <h4 className={`text-xs font-semibold ${textPrimary}`}>Contraste Tipográfico</h4>
          <p className={`text-[10px] max-w-[280px] ${textSecondary}`}>
            Alterna entre Regular (400) y Medium (500) para validar la legibilidad del texto secundario.
          </p>
        </div>
        <button
          type="button"
          onClick={handleWeightToggle}
          title="Alternar peso del texto secundario"
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-300 active:scale-95 ${
            fontWeight === 500
              ? 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20'
              : chipIdle
          }`}
        >
          {fontWeight === 400 ? 'Regular (400)' : 'Medium (500)'}
        </button>
      </div>

      {/* 4. Selector de Color de Acento */}
      <div className={`p-5 rounded-2xl border space-y-3 ${controlBg} ${controlBorder}`}>
        <h4 className={`text-xs font-semibold ${textPrimary}`}>Color de Acento de la Marca</h4>
        <div className="flex flex-wrap gap-3">
          {ACCENT_OPTIONS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => handleAccentChange(c.hex)}
              title={c.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all active:scale-[0.98] ${chipIdle} ${
                accent === c.hex ? 'ring-1 ring-fuchsia-500/30' : ''
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              <span className="text-[11px] font-medium">{c.name}</span>
              {accent === c.hex && <Check className="w-3 h-3 text-fuchsia-500 ml-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Tarjeta de Verificación en Vivo */}
      <div className="p-1">
        <h4 className={`text-xs font-semibold mb-2 ${textPrimary}`}>Previsualización de Tarjeta</h4>
        <div className={`rounded-3xl border space-y-3 ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold ${textPrimary}`}>Superficie Premium</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>
              Activo
            </span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Esta tarjeta consume los tokens globales inyectados directamente en el documento. Al cambiar
            los sliders superiores, la GPU renderiza las transiciones instantáneamente a 60 FPS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalTokensInspector;