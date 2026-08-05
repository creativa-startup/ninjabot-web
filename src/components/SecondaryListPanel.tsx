import React from 'react';

interface SecondaryListPanelProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const SecondaryListPanel: React.FC<SecondaryListPanelProps> = ({
  title,
  subtitle,
  headerAction,
  children,
}) => {
  return (
    <aside className="w-80 shrink-0 h-full bg-white border-r border-slate-200 flex flex-col select-none">
      {/* Cabecera Estandarizada */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Lista de Contenido */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {children}
      </div>
    </aside>
  );
};