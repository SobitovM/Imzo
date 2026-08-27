import React from 'react';
import { LogOut, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Order } from '../types';
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
  const isManagerView = currentView === 'manager_panel';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Left: IMZO Brand Identity */}
        <div 
          onClick={() => {
            if (isManagerView) return;
            onSelectView(currentClientOrder ? 'client_dashboard' : 'client_login');
          }}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none"
        >
          <div className="flex items-center py-1">
            <ImzoLogo size="md" className="h-7 sm:h-9" />
          </div>

          <div className="min-w-0 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-200">
                {isManagerView ? 'Boshqaruv & Sifat Nazorati' : 'Mijoz Portali'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Sifat Nazorati
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              {isManagerView ? 'Bitrix24 & Ishlab Chiqarish Markazi' : 'Elektron Kafolat & Servis Xizmati (60 Oy)'}
            </p>
          </div>
        </div>

        {/* Right side: Client or Admin state */}
        <div className="flex items-center gap-2 shrink-0">
          {/* If on Manager View, provide a button to return to Client Portal */}
          {isManagerView ? (
            <button
              id="nav-btn-back-to-client"
              onClick={() => onSelectView('client_login')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Mijoz Portaliga Qaytish</span>
            </button>
          ) : (
            <>
              {/* If Client Logged in, show client name and logout */}
              {currentClientOrder && currentView === 'client_dashboard' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                  <span className="text-slate-400 hidden sm:inline">Mijoz:</span>
                  <strong className="text-white truncate max-w-[130px] sm:max-w-[200px]">
                    {currentClientOrder.clientFullName.split(' ')[0]}
                  </strong>
                  <button
                    id="nav-btn-client-logout"
                    onClick={onLogoutClient}
                    className="text-slate-400 hover:text-rose-400 ml-1 p-0.5 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Chiqish"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Chiqish</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
