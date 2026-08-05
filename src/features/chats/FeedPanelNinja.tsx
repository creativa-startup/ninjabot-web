/**
 * @module FeedPanelNinja
 * @description Panel de tendencias del feed Ninja (N2) — ultra-minimalista B/N.
 * Componente [Panel] presentacional puro: reemplaza el área de ChatN2List
 * cuando el modo Feed Ninja está activo. Fondo 100% transparente para que
 * herede el token --panel-n2 de la raíz (ChatN2ListPanel).
 *
 * Rediseño Social Commerce (Modo Ninja):
 *   - Header "El ritmo del Jazs" como titular ligero (text-lg font-medium
 *     tracking-tight text-white/90).
 *   - Tendencias en TEXTO PLANO y corrido, separadas por puntos medianos
 *     (·) — sin píldoras, cajas, contornos ni avatar groups pesados.
 *   - Estética minimalista B/N: tipografía fina (font-light) con opacidad.
 */

import React from 'react';

/** Ítem de tendencia para el feed Ninja */
export interface TrendItem {
  /** Etiqueta de la tendencia (sin el prefijo #) */
  tag: string;
  /** Cantidad de publicaciones asociadas */
  count: number;
}

export interface FeedPanelNinjaProps {
  /** Lista de tendencias a renderizar */
  trends?: TrendItem[];
  /** Hashtag activo seleccionado (null = todas las tendencias) */
  activeHashtag?: string | null;
  /** Callback al hacer clic en una tendencia */
  onSelectHashtag?: (tag: string) => void;
  /** Callback al presionar el link "feed" (actualizar/recargar feed) */
  onRefreshFeed?: () => void;
}

export const FeedPanelNinja: React.FC<FeedPanelNinjaProps> = ({
  trends = [],
  activeHashtag = null,
  onSelectHashtag,
  onRefreshFeed,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-transparent text-white select-none overflow-hidden">
      {/* Cabecera del panel: titular ligero "El ritmo del Jazs" */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <span className="text-lg font-medium tracking-tight text-white/90">
          El ritmo del Jazs
        </span>
      </div>

      {/* Tendencias en texto plano y corrido — separadas por puntos medianos */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-gray-500/60 mb-2">
            Tendencias
          </h3>
          {trends.length === 0 ? (
            <p className="text-xs text-secondary/60 leading-relaxed font-light">
              No hay tendencias disponibles.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
              {trends.map((trend, index) => (
                <React.Fragment key={trend.tag}>
                  {/* Separador · entre tendencias (no antes de la primera) */}
                  {index > 0 && (
                    <span className="text-xs text-secondary/60 leading-relaxed font-light select-none">
                      ·
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectHashtag?.(trend.tag)}
                    className={`text-xs leading-relaxed font-light transition-colors ${
                      activeHashtag === trend.tag
                        ? 'text-fuchsia-400'
                        : 'text-secondary/60 hover:text-white/90'
                    }`}
                    aria-pressed={activeHashtag === trend.tag}
                    title={`Ver publicaciones de #${trend.tag} (${trend.count})`}
                  >
                    #{trend.tag}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pie informativo */}
      <div className="px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={onRefreshFeed}
          className="text-xs text-gray-500/80 hover:text-gray-300 transition-colors"
          title="Actualizar feed"
        >
          feed · actualizar
        </button>
      </div>
    </div>
  );
};

export default FeedPanelNinja;