import React from 'react';
import { MessageSquare, Users, Filter, LogOut, Settings } from 'lucide-react';
import type { NavigationTab } from '../types';
import whiteLogo from '../assets/ninjabot_logotipo_blanco.png';

interface SidebarPCProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onLogoutClick?: () => void;
}

export const SidebarPC: React.FC<SidebarPCProps> = ({
  activeTab,
  setActiveTab,
  onLogoutClick,
}) => {
  return (
    <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center justify-between pb-4 pt-0 shrink-0 select-none overflow-hidden">
      {/* Top Logo - Flush to top/left/right edges ("a sangre") */}
      <div className="w-16 h-16 bg-black flex items-center justify-center shrink-0 p-2.5">
        <img src={whiteLogo} alt="Ninjabot Logo" className="w-full h-full object-contain" />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col items-center gap-5 mt-4">
          <button
            onClick={() => setActiveTab('chats')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'chats'
                ? 'text-black bg-gray-100 shadow-xs'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Chats de WhatsApp"
          >
            <MessageSquare className="w-6 h-6 stroke-[1.8]" />
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'contacts'
                ? 'text-black bg-gray-100 shadow-xs'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Contactos y Leads"
          >
            <Users className="w-6 h-6 stroke-[1.8]" />
          </button>

          <button
            onClick={() => setActiveTab('funnel')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'funnel'
                ? 'text-black bg-gray-100 shadow-xs'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Embudo de Ventas (Pipeline CRM)"
          >
            <Filter className="w-6 h-6 stroke-[1.8]" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'text-black bg-gray-100 shadow-xs'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Configuración de Agente IA"
          >
            <Settings className="w-6 h-6 stroke-[1.8]" />
          </button>
        </nav>

      {/* Bottom Exit Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={onLogoutClick}
          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          title="Salir / Cerrar Sesión"
        >
          <LogOut className="w-6 h-6 stroke-[1.8]" />
        </button>
      </div>
    </aside>
  );
};
