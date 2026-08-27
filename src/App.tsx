/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClientLogin } from './components/ClientLogin';
import { ClientDashboard } from './components/ClientDashboard';
import { ManagerBitrixPanel } from './components/ManagerBitrixPanel';
import { Order } from './types';
import { getStoredOrders } from './services/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<'client_login' | 'client_dashboard' | 'manager_panel'>('client_login');
  const [currentClientOrder, setCurrentClientOrder] = useState<Order | null>(null);

  // Check URL token on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const orders = getStoredOrders();

    if (token) {
      const matched = orders.find((o) => o.credentials.directToken === token);
      if (matched) {
        setCurrentClientOrder(matched);
        setCurrentView('client_dashboard');
        return;
      }
    }

    // Default to client login
    setCurrentView('client_login');
  }, []);

  const handleClientLoginSuccess = (order: Order) => {
    setCurrentClientOrder(order);
    setCurrentView('client_dashboard');
  };

  const handleLogoutClient = () => {
    setCurrentClientOrder(null);
    setCurrentView('client_login');
    // Clear URL token if any
    if (window.location.search.includes('token=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleOpenClientFromManager = (order: Order) => {
    setCurrentClientOrder(order);
    setCurrentView('client_dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        currentClientOrder={currentClientOrder}
        onSelectView={setCurrentView}
        onLogoutClient={handleLogoutClient}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {currentView === 'client_login' && (
          <ClientLogin
            onLoginSuccess={handleClientLoginSuccess}
            onSwitchToManager={() => setCurrentView('manager_panel')}
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

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <p>
          Fabrika & Bitrix24 OKK Sifat Nazorati va Mijoz Shaxsiy Kabineti Tizimi • 2026
        </p>
      </footer>
    </div>
  );
}
