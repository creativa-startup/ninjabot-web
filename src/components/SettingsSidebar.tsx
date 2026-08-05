import React from 'react';
import { User, Building2, Bot } from 'lucide-react';
import { SecondaryListPanel } from './SecondaryListPanel';

export type SettingsTab = 'profile' | 'company' | 'ai_agent';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const TABS: { id: SettingsTab; icon: React.ReactNode; label: string; description: string }[] = [
  { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Perfil', description: 'Tus datos personales' },
  { id: 'company', icon: <Building2 className="w-5 h-5" />, label: 'Empresa', description: 'Información del negocio' },
  { id: 'ai_agent', icon: <Bot className="w-5 h-5" />, label: 'Agente IA', description: 'Configuración del bot' },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <SecondaryListPanel title="Configuraciones" subtitle="Administra tu cuenta y bot">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
              isActive
                ? 'bg-black text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="w-5 h-5 shrink-0">{tab.icon}</span>
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                {tab.label}
              </div>
              <div className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                {tab.description}
              </div>
            </div>
          </button>
        );
      })}
    </SecondaryListPanel>
  );
};