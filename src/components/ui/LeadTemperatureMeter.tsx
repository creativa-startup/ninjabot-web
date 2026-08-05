import React from 'react';

export type LeadTemperatureLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface LeadTemperatureMeterProps {
  level: LeadTemperatureLevel;
  className?: string;
}

/**
 * Paleta enterprise de temperatura del lead (frío → caliente):
 * 1-2: azul (frío/templado-bajo)
 * 3: ámbar (templado)
 * 4-5: rosa/rojo (caliente)
 * Colores sólidos sutiles, sin gradientes llamativos.
 * Segmentos inactivos: fondo translúcido (bg-black/5) — regla estricta.
 */
const SEGMENT_COLORS: Record<number, string> = {
  1: 'bg-blue-400',
  2: 'bg-sky-400',
  3: 'bg-amber-400',
  4: 'bg-orange-500',
  5: 'bg-rose-500',
};

const TEMPERATURE_LABELS: Record<LeadTemperatureLevel, string> = {
  0: 'Lead Perdido (Oportunidad cerrada sin éxito)',
  1: 'Lead Frío (Contacto inicial)',
  2: 'Lead Templado-Bajo (Interesado)',
  3: 'Lead Templado (En evaluación)',
  4: 'Lead Caliente (Negociación)',
  5: 'Lead Muy Caliente (Cierre inminente)',
};

export const LeadTemperatureMeter: React.FC<LeadTemperatureMeterProps> = ({
  level = 1,
  className = '',
}) => {
  const isLost = level === 0;

  return (
    <div
      title={TEMPERATURE_LABELS[level]}
      className={`flex flex-col gap-0.5 h-full py-0.5 shrink-0 ${className}`}
    >
      {/* 5 segmentos LED verticales: el nivel determina cuántos se encienden */}
      {[5, 4, 3, 2, 1].map((segment) => {
        const isActive = !isLost && level >= segment;
        return (
          <div
            key={segment}
            className={`flex-1 w-1.5 rounded-full transition-all duration-300 ${
              isActive
                ? SEGMENT_COLORS[segment]
                : 'bg-black/5'
            }`}
          />
        );
      })}
    </div>
  );
};