import React from 'react';
import { Smartphone, Building2, LogOut, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { resetDemoData } from '../services/storage';
import { ImzoLogo } from './ImzoLogo';

interface NavbarProps {
  currentView: 'client_login' | 'client_dashboard' | 'manager_panel';
  currentClientOrder: Order | null;
  onSelectView: (view: 'client_login' | 'client_dashboard' | 'manager_panel') => void;
  onLogoutClient: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentClientOrder,
  onSelectView,
  onLogoutClient,
}) => {
  const handleResetData = () => {
    if (window.confirm('Barcha ma\'lumotlarni dastlabki holatga qaytarishni xohlaysizmi?')) {
      resetDemoData();
      onLogoutClient();
      onSelectView('manager_panel');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Left: IMZO Brand Identity */}
        <div 
          onClick={() => onSelectView(currentClientOrder ? 'client_dashboard' : 'client_login')}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none"
        >
          <div className="flex items-center py-1">
            <ImzoLogo size="md" className="h-7 sm:h-9" />
          </div>

          <div className="min-w-0 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-200">
                Mijoz Portali
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Sifat Nazorati
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              Elektron Kafolat & Servis Xizmati
            </p>
          </div>
        </div>

        {/* Center/Right: Role and View Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mode Switcher Pill */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              id="nav-btn-client-view"
              onClick={() => onSelectView(currentClientOrder ? 'client_dashboard' : 'client_login')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'client_login' || currentView === 'client_dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Mijoz</span>
              <span className="hidden sm:inline">Kabineti</span>
              {currentClientOrder && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              id="nav-btn-manager-view"
              onClick={() => onSelectView('manager_panel')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'manager_panel'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Sifat Nazorati</span>
              <span className="hidden sm:inline">& Menejer</span>
            </button>
          </div>

          {/* If Logged in as Client, show client chip */}
          {currentClientOrder && currentView === 'client_dashboard' && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <span className="text-slate-400">Mijoz:</span>
              <strong className="text-white truncate max-w-[120px]">{currentClientOrder.clientFullName.split(' ')[0]}</strong>
              <button
                onClick={onLogoutClient}
                className="text-slate-400 hover:text-rose-400 ml-1 p-0.5"
                title="Chiqish"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Reset Demo Button */}
          <button
            id="nav-btn-reset-demo"
            onClick={handleResetData}
            title="Dastlabki holatga qaytarish"
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
