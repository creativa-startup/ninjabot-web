import React from 'react';
import { TrendingUp, Link2, Sparkles, AlertTriangle, Bot, ArrowLeft } from 'lucide-react';
import type { Notification, NotificationType } from '../types';

interface NotificationDetailPanelProps {
  notification: Notification;
  onBackClick?: () => void;
  showBackArrow?: boolean;
}

const TYPE_DETAILS: Record<NotificationType, { icon: React.ReactNode; label: string; color: string }> = {
  sales_summary: {
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Resumen de Ventas',
    color: 'bg-emerald-500',
  },
  integration_recommendation: {
    icon: <Link2 className="w-5 h-5" />,
    label: 'Recomendación de Integración',
    color: 'bg-blue-500',
  },
  ai_suggestion: {
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Sugerencia IA',
    color: 'bg-purple-500',
  },
  system_alert: {
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Alerta del Sistema',
    color: 'bg-amber-500',
  },
};

export const NotificationDetailPanel: React.FC<NotificationDetailPanelProps> = ({
  notification,
  onBackClick,
  showBackArrow = false,
}) => {
  const typeInfo = TYPE_DETAILS[notification.type];

  return (
    <div className="w-full h-full flex flex-col bg-[#eaeaea] sm:bg-[#eeeeee] relative overflow-hidden select-none">
      {/* Header Bar */}
      <div className="bg-[#f2f2f2] border-b border-gray-300 px-3 sm:px-5 py-2.5 flex items-center gap-2 sm:gap-3 shrink-0 shadow-xs z-10">
        {showBackArrow && (
          <button
            onClick={onBackClick}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-700 shrink-0"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        <div className={`w-8 h-8 rounded-full ${typeInfo.color} flex items-center justify-center shrink-0 text-white shadow-xs`}>
          {typeInfo.icon}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
            {notification.title}
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {typeInfo.label} · {notification.timestamp}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Notification Content */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100">
            <div className="prose prose-sm max-w-none">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-gray-700" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ninjabot Asistente</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                {notification.content}
              </p>
            </div>
          </div>

          {/* Action CTA Buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider px-1">Acciones rápidas</p>
              {notification.actions.map((action, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-xs transition-all active:scale-[0.99] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-black">
                      {action.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 group-hover:text-black">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Read indicator */}
          <div className="text-center pt-2">
            <span className={`text-[10px] font-medium ${notification.read ? 'text-gray-400' : 'text-blue-500'}`}>
              {notification.read ? '✓ Leído' : '● No leído'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};