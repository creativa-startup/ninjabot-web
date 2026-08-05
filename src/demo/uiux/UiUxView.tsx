/**
 * @module UiUxView
 * @description Orquestador principal de la vista de Apariencia (UI/UX).
 * Administra la barra de sub-pestañas entre el Estudio Global (Tokens de Capa 1)
 * y el Inspector de Componentes (Playground de auditoría aislada).
 *
 * Guardián de Seguridad (Admin-Only): si el consumidor indica `isAdmin={false}`,
 * renderiza una tarjeta de acceso restringido estéticamente pulida — los
 * controles sensibles que alteran la materialidad global quedan bloqueados.
 *
 * En el Sandbox demo el default es `true` (LayoutDemo no gestiona perfiles reales).
 */

import React, { useState } from 'react';
import { Palette, Layers, Lock, AlertTriangle } from 'lucide-react';
import { GlobalTokensInspector } from './components/GlobalTokensInspector';
import { ComponentPlayground } from './components/ComponentPlayground';

export interface UiUxViewProps {
  /** Tema del shell maestro (dark/light) para adaptar superficies translúcidas */
  isDark?: boolean;
  /** Guardián Admin-Only: false bloquea el acceso al Estudio del Sistema de Diseño */
  isAdmin?: boolean;
}

type StudioTab = 'global' | 'playground';

/* ═══ Error Boundary — muestra el error REAL en pantalla en vez de blank screen ═══ */
class StudioErrorBoundary extends React.Component<
  { isDark: boolean; children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { isDark: boolean; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('[UiUxView] Error capturado en el Estudio del Sistema de Diseño:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full animate-fade-in">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border ${this.props.isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-red-50 border-red-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${this.props.isDark ? 'text-rose-400' : 'text-red-500'}`} />
          </div>
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${this.props.isDark ? 'text-white' : 'text-gray-900'}`}>
            Error en el Estudio del Sistema de Diseño
          </h3>
          <p className={`text-[11px] max-w-xs mt-1.5 leading-relaxed ${this.props.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className={`mt-4 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
              this.props.isDark
                ? 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                : 'bg-black/5 border-black/5 text-gray-700 hover:bg-black/10'
            }`}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const UiUxView: React.FC<UiUxViewProps> = ({
  isDark = false,
  isAdmin = true,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('global');

  /* Doble Defensa de Seguridad */
  const isAllowed = isAdmin;

  if (!isAllowed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3 border border-red-100">
          <Lock className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
          Acceso Restringido
        </h3>
        <p className="text-[11px] text-gray-500 max-w-xs mt-1.5 leading-relaxed">
          El Estudio del Sistema de Diseño contiene controles sensibles que alteran la
          materialidad y densidad global de la consola. El acceso está restringido
          únicamente a administradores.
        </p>
      </div>
    );
  }

  /* Estilos de tabs según tema */
  const tabActive = isDark
    ? 'bg-white/15 text-white font-medium'
    : 'bg-gray-100 text-gray-900 font-medium';
  const tabIdle = isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-Pestañas de Control */}
      <div
        className={`flex-shrink-0 px-4 sm:px-6 py-2 flex gap-2 sm:gap-4 border-b transition-colors duration-500 ${
          isDark ? 'bg-transparent border-white/10' : 'bg-white/80 backdrop-blur-md border-black/5'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
            activeTab === 'global' ? tabActive : tabIdle
          }`}
        >
          <Palette size={14} strokeWidth={1.5} />
          Tokens Globales (Capa 1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('playground')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
            activeTab === 'playground' ? tabActive : tabIdle
          }`}
        >
          <Layers size={14} strokeWidth={1.5} />
          Inspector de Componentes
        </button>
      </div>

      {/* Área del Contenido con Scroll (protegida por Error Boundary visible) */}
      <StudioErrorBoundary isDark={isDark}>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'global' ? (
            <GlobalTokensInspector isDark={isDark} />
          ) : (
            <ComponentPlayground isDark={isDark} />
          )}
        </div>
      </StudioErrorBoundary>
    </div>
  );
};

export default UiUxView;