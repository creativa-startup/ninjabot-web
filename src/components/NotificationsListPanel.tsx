import React from 'react';
import { TrendingUp, Link2, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react';
import type { Notification, NotificationType } from '../types';

interface NotificationsListPanelProps {
  notifications: Notification[];
  activeNotificationId: string | null;
  onSelectNotification: (notification: Notification) => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  sales_summary: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'bg-emerald-500',
  },
  integration_recommendation: {
    icon: <Link2 className="w-4 h-4" />,
    color: 'bg-blue-500',
  },
  ai_suggestion: {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-purple-500',
  },
  system_alert: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-amber-500',
  },
};

export const NotificationsListPanel: React.FC<NotificationsListPanelProps> = ({
  notifications,
  activeNotificationId,
  onSelectNotification,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#efeff0] sm:bg-[#f4f4f5] border-r border-gray-200 select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#f8f8f8] sm:bg-white border-b border-gray-200 flex items-center gap-2 shrink-0">
        <div className="bg-black text-white px-5 py-1.5 rounded-full font-bold text-sm tracking-wide shrink-0 shadow-2xs flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Asistente</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {notifications.filter((n) => !n.read).length} sin leer
        </span>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm font-medium">
            No hay notificaciones del asistente
          </div>
        ) : (
          notifications.map((notification) => {
            const isSelected = notification.id === activeNotificationId;
            const config = TYPE_CONFIG[notification.type];

            return (
              <div
                key={notification.id}
                onClick={() => onSelectNotification(notification)}
                className={`px-3.5 sm:px-4 py-3 transition-colors cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#ffffff] sm:bg-[#e9e9eb] shadow-2xs'
                    : 'bg-[#f4f4f5] hover:bg-white/80'
                }`}
              >
                {/* Type Icon */}
                <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm truncate ${notification.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {notification.timestamp}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                  <p className={`text-xs mt-0.5 line-clamp-2 ${notification.read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {notification.preview}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};