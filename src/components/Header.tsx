import React from 'react';
import { ArrowLeft } from 'lucide-react';
import whiteLogo from '../assets/ninjabot_logotipo_blanco.png';

interface HeaderProps {
  subtitle?: string;
  showBackArrow?: boolean;
  onBackClick?: () => void;
  isMobileView?: boolean;
  showLogoIcon?: boolean;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  subtitle = "Mensajería Inteligente",
  showBackArrow = false,
  onBackClick,
  showLogoIcon = true,
  userName,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between shrink-0 select-none overflow-hidden pl-0 pr-3 sm:pr-4">
      <div className="flex items-center h-full gap-2 sm:gap-3">
        {showLogoIcon && (
          <div className="bg-black h-full aspect-square flex items-center justify-center shrink-0 p-2.5">
            <img src={whiteLogo} alt="Ninjabot Logo" className="w-full h-full object-contain" />
          </div>
        )}

        {showBackArrow && (
          <button
            onClick={onBackClick}
            className="p-1 ml-1 hover:bg-gray-100 rounded-full transition-colors text-gray-700 active:scale-95 shrink-0"
            title="Volver a lista de chats"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        <span className="font-extrabold text-lg sm:text-xl text-black tracking-tight font-sans pl-1">
          Ninjabot
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right">
          <span className="text-[10px] sm:text-xs text-gray-500 font-bold tracking-normal block">
            {subtitle}
          </span>
          {userName && (
            <span className="text-[11px] sm:text-xs text-black font-semibold block truncate max-w-[180px]">
              {userName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};


