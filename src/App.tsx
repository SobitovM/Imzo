/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// App.tsx - useEffect ichida
useEffect(() => {
  // 🔥 Eski sertifikat raqamlarini migratsiya qilish
  migrateCertificateNumbers();
  
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, X, ArrowRight } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ClientLogin } from './components/ClientLogin';
import { ClientDashboard } from './components/ClientDashboard';
import { ManagerBitrixPanel } from './components/ManagerBitrixPanel';
import { Order } from './types';
import { getStoredOrders } from './services/storage';
import { getAuthSession, saveAuthSession, clearAuthSession, isAuthSessionValid } from './services/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<'client_login' | 'client_dashboard' | 'manager_panel'>('client_login');
  const [currentClientOrder, setCurrentClientOrder] = useState<Order | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // 🔥 Sayt yuklanganda avvalgi session ni tekshirish
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const adminParam = params.get('admin');
    const orders = getStoredOrders();

    // 1. Admin panel
    if (adminParam === 'true' || adminParam === '1') {
      setCurrentView('manager_panel');
      return;
    }

    // 2. URL token orqali login
    if (token) {
      const matched = orders.find((o) => o.credentials.directToken === token);
      if (matched) {
        setCurrentClientOrder(matched);
        setCurrentView('client_dashboard');
        // 🔥 Session ni saqlash
        saveAuthSession({
          orderId: matched.id,
          login: matched.credentials.login,
          pinCode: matched.credentials.pinCode,
          timestamp: Date.now(),
        });
        return;
      }
    }

    // 3. 🔥 LOCAL STORAGE dan session ni tekshirish
    const savedSession = getAuthSession();
    if (savedSession && isAuthSessionValid(savedSession)) {
      const matched = orders.find((o) => o.id === savedSession.orderId);
      if (matched) {
        setCurrentClientOrder(matched);
        setCurrentView('client_dashboard');
        return;
      } else {
        // Order topilmasa, session ni tozalash
        clearAuthSession();
      }
    }

    // 4. Default: login ekrani
    setCurrentView('client_login');
  }, []);

  const handleClientLoginSuccess = (order: Order) => {
    setCurrentClientOrder(order);
    setCurrentView('client_dashboard');
    // 🔥 Session ni saqlash
    saveAuthSession({
      orderId: order.id,
      login: order.credentials.login,
      pinCode: order.credentials.pinCode,
      timestamp: Date.now(),
    });
  };

  const handleLogoutClient = () => {
    setCurrentClientOrder(null);
    setCurrentView('client_login');
    // 🔥 Session ni tozalash
    clearAuthSession();
    // URL dan token ni o'chirish
    if (window.location.search.includes('token=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleOpenClientFromManager = (order: Order) => {
    setCurrentClientOrder(order);
    setCurrentView('client_dashboard');
    // 🔥 Session ni saqlash
    saveAuthSession({
      orderId: order.id,
      login: order.credentials.login,
      pinCode: order.credentials.pinCode,
      timestamp: Date.now(),
    });
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const allowed = ['1234'];
    if (allowed.includes(adminPassword.trim().toLowerCase())) {
      setIsAdminModalOpen(false);
      setAdminPassword('');
      setCurrentView('manager_panel');
    } else {
      setAdminError('Admin paroli noto\'g\'ri kiritildi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar
        currentView={currentView}
        currentClientOrder={currentClientOrder}
        onSelectView={setCurrentView}
        onLogoutClient={handleLogoutClient}
      />

      <main className="flex-1 p-3 sm:p-6 lg:p-8">
        {currentView === 'client_login' && (
          <ClientLogin
            onLoginSuccess={handleClientLoginSuccess}
            onSwitchToManager={() => setIsAdminModalOpen(true)}
          />
        )}

        {currentView === 'client_dashboard' && currentClientOrder && (
          <ClientDashboard
            order={currentClientOrder}
            onLogout={handleLogoutClient}
          />
        )}

        {currentView === 'manager_panel' && (
          <ManagerBitrixPanel
            onOpenClientCabinet={handleOpenClientFromManager}
          />
        )}
      </main>

      <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] sm:text-xs">
            IMZO • Sifat Nazorati va Mijoz Shaxsiy Kabineti Tizimi (60 Oy Kafolat)
          </p>

          {currentView !== 'manager_panel' && (
            <button
              id="btn-open-admin-dialog"
              onClick={() => setIsAdminModalOpen(true)}
              className="text-[11px] text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Admin / Boshqaruv</span>
            </button>
          )}
        </div>
      </footer>

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Admin Boshqaruv Tizimi</h3>
                  <p className="text-[11px] text-slate-400">Sifat nazoratchisi & Bitrix24</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Paroli:
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Parolni kiriting..."
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {adminError && (
                <p className="text-xs text-rose-400">{adminError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Panelga Kirish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}, []);
