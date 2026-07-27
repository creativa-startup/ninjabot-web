import React from 'react';
import { MessageSquare, Users, Filter, Settings } from 'lucide-react';
import type { NavigationTab } from '../types';

interface MobileTabsProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white border-b border-gray-300 flex items-center justify-around py-2.5 px-6 shrink-0 select-none">
      <button
        onClick={() => setActiveTab('chats')}
        className={`p-1.5 transition-all active:scale-95 ${
          activeTab === 'chats' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Chats"
      >
        <MessageSquare className="w-7 h-7 stroke-[1.6]" />
      </button>

      <button
        onClick={() => setActiveTab('contacts')}
        className={`p-1.5 transition-all active:scale-95 ${
          activeTab === 'contacts' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Contactos"
      >
        <Users className="w-8 h-8 stroke-[1.6]" />
      </button>

      <button
        onClick={() => setActiveTab('funnel')}
        className={`p-1.5 transition-all active:scale-95 ${
          activeTab === 'funnel' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Embudo CRM"
      >
        <Filter className="w-7 h-7 stroke-[1.6]" />
      </button>

      <button
        onClick={() => setActiveTab('settings')}
        className={`p-1.5 transition-all active:scale-95 ${
          activeTab === 'settings' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Ajustes Agente IA"
      >
        <Settings className="w-6 h-6 stroke-[1.6]" />
      </button>
    </nav>
  );
};

