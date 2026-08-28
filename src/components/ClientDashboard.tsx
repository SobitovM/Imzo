import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Wrench, 
  FileText, 
  Building2, 
  UserCheck, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ChevronDown,
  ChevronUp,
  LogOut,
  Palette,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Order, ServiceTicket } from '../types';
import { getStoredTickets, getClientOrders } from '../services/storage';
import { WarrantyModal } from './WarrantyModal';
import { ServiceRequestModal } from './ServiceRequestModal';
import { ServiceHistory } from './ServiceHistory';

interface ClientDashboardProps {
  order: Order;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ order: initialOrder, onLogout }) => {
  const [activeOrder, setActiveOrder] = useState<Order>(initialOrder);
  const [clientOrders, setClientOrders] = useState<Order[]>([initialOrder]);
  const [isOrdersListOpen, setIsOrdersListOpen] = useState(true);
  const [isWarrantyOpen, setIsWarrantyOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<'options' | 'form'>('options');
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);

  useEffect(() => {
    const allMatching = getClientOrders(initialOrder.credentials.login || initialOrder.clientPhone || initialOrder.invoiceNumber);
    if (allMatching.length > 0) {
      setClientOrders(allMatching);
      const stillValid = allMatching.find((o) => o.id === activeOrder.id);
      if (!stillValid) {
        setActiveOrder(allMatching[0]);
      }
    } else {
      setClientOrders([initialOrder]);
      setActiveOrder(initialOrder);
    }
  }, [initialOrder]);

  const loadTickets = () => {
    const all = getStoredTickets();
    const allInvoices = clientOrders.map((o) => o.invoiceNumber.toUpperCase());
    const allIds = clientOrders.map((o) => o.id);

    const clientTickets = all.filter(
      (t) =>
        allIds.includes(t.orderId) ||
        allInvoices.includes(t.invoiceNumber.toUpperCase()) ||
        t.clientFullName.toLowerCase() === activeOrder.clientFullName.toLowerCase()
    );
    setTickets(clientTickets);
  };

  useEffect(() => {
    loadTickets();
    const handler = () => loadTickets();
    window.addEventListener('tickets_updated', handler);
    return () => window.removeEventListener('tickets_updated', handler);
  }, [activeOrder, clientOrders]);

  const isOrderReady = (ord: Order) => ['okk_otdi', 'topshirildi'].includes(ord.status);
  const activeIsReady = isOrderReady(activeOrder);

  const totalArea = activeOrder.products.reduce((sum, p) => sum + (p.areaSqM || 0), 0);
  const seriesList = activeOrder.products.map(p => p.model).filter(m => m && m !== '-' && m !== "Bo'sh");
  const seriesNames = seriesList.length > 0 ? Array.from(new Set(seriesList)).join(', ') : "Bo'sh";
  
  const colorList = activeOrder.products.map(p => p.color).filter(c => c && c !== '-' && c !== "Bo'sh");
  const colorNames = colorList.length > 0 ? Array.from(new Set(colorList)).join(', ') : "Bo'sh";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 pb-16 px-2.5 sm:px-4">
      
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex items-center justify-between shadow-lg gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm sm:text-base shrink-0">
            {activeOrder.clientFullName && activeOrder.clientFullName !== "Bo'sh" ? activeOrder.clientFullName.charAt(0) : 'M'}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-white leading-tight truncate">
              {activeOrder.clientFullName && activeOrder.clientFullName !== "Bo'sh" ? activeOrder.clientFullName : "Bo'sh"}
            </h1>
            <p className={`text-[11px] sm:text-xs font-mono truncate ${activeOrder.clientPhone && activeOrder.clientPhone !== 'Bo\'sh' ? 'text-slate-400' : 'text-slate-500 italic'}`}>
              {activeOrder.clientPhone && activeOrder.clientPhone !== 'Bo\'sh' ? activeOrder.clientPhone : "Bo'sh"}
            </p>
          </div>
        </div>

        <button
          id="btn-client-logout"
          onClick={onLogout}
          className="px-2.5 sm:px-3 py-2 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/60 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 min-h-[38px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <button
          id="btn-toggle-orders-list"
          type="button"
          onClick={() => setIsOrdersListOpen(!isOrdersListOpen)}
          className="w-full p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 hover:bg-slate-800/60 flex items-center justify-between transition-colors text-left cursor-pointer min-h-[56px]"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400">
                  Buyurtmalaringiz:
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Jami: {clientOrders.length} ta
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                Buyurtmalar Ro'yxati {isOrdersListOpen ? '(Ochiq)' : '(Ko\'rish)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium shrink-0 pl-1">
            <span className="hidden sm:inline">{isOrdersListOpen ? 'Yopish' : 'Ko\'rish'}</span>
            {isOrdersListOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-300" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOrdersListOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-800 p-2.5 sm:p-4 space-y-2 bg-slate-950/50"
            >
              <p className="text-[11px] text-slate-400 font-medium px-1">
                Batafsil ko'rish uchun schet raqami ustiga bosing:
              </p>

              <div className="space-y-2">
                {clientOrders.map((ord) => {
                  const isSelected = ord.id === activeOrder.id;
                  const isReady = isOrderReady(ord);

                  return (
                    <button
                      key={ord.id}
                      id={`btn-select-order-${ord.invoiceNumber}`}
                      type="button"
                      onClick={() => setActiveOrder(ord)}
                      className={`w-full p-3 sm:p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer gap-2 ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-mono text-xs sm:text-sm font-bold text-white">
                            {ord.invoiceNumber}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 bg-blue-500 text-slate-950 rounded">
                              Tanlangan
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-300 truncate max-w-xs sm:max-w-md">
                          {ord.products.map((p) => p.name).join(', ')}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-bold whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                            Tayyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] sm:text-xs font-bold whitespace-nowrap">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                            Jarayonda
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        key={activeOrder.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-xl space-y-4 sm:space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tanlangan Buyurtma Ma'lumotlari:
            </span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold text-white font-mono">
                {activeOrder.invoiceNumber}
              </h2>
              {activeIsReady ? (
                <span className="px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Tayyor (Sifat nazoratidan o'tgan)
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Jarayonda
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-400">
            Kafolat: <strong className="text-amber-400 font-bold">
              {(activeOrder.warranty?.warrantyPeriodMonths && activeOrder.warranty.warrantyPeriodMonths >= 60) ? activeOrder.warranty.warrantyPeriodMonths : 60} Oy (5 Yil)
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm">
          
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Schet Raqami:</span>
            <span className="text-amber-300 font-mono font-bold text-sm sm:text-base mt-0.5">
              {activeOrder.invoiceNumber}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Seriya / Model:</span>
            <span className={`font-semibold mt-0.5 truncate ${seriesNames !== "Bo'sh" ? 'text-white' : 'text-slate-500 font-normal italic'}`}>
              {seriesNames}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Profil Rangi:</span>
            <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5 truncate">
              <Palette className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className={`truncate ${colorNames !== "Bo'sh" ? 'text-white' : 'text-slate-500 font-normal italic'}`}>
                {colorNames}
              </span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Umumiy Maydoni (kv.m):</span>
            <span className={`font-bold text-sm sm:text-base font-mono mt-0.5 ${totalArea > 0 ? 'text-emerald-400' : 'text-slate-500 font-normal italic'}`}>
              {totalArea > 0 ? `${totalArea.toFixed(2)} kv.m` : "Bo'sh"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Zakaz Berilgan Sana:</span>
            <span className="text-slate-200 font-semibold font-mono flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{activeOrder.orderDate && activeOrder.orderDate !== 'Bo\'sh' ? activeOrder.orderDate : "Bo'sh"}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Tayyor Bo'lgan Sana:</span>
            <span className="text-slate-200 font-semibold font-mono flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{activeOrder.readyDate && activeOrder.readyDate !== 'Bo\'sh' ? activeOrder.readyDate : (activeIsReady ? 'Tasdiqlangan' : "Bo'sh")}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Showroom Filiali:</span>
            <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className={`truncate ${activeOrder.showroomName && activeOrder.showroomName !== 'Bo\'sh' ? 'text-white' : 'text-slate-500 font-normal italic'}`}>
                {activeOrder.showroomName && activeOrder.showroomName !== 'Bo\'sh' ? activeOrder.showroomName : "Bo'sh"}
              </span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] sm:text-[11px] block font-medium">Mas'ul Menedjer:</span>
            <div>
              <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className={`truncate ${activeOrder.salesManagerName && activeOrder.salesManagerName !== 'Bo\'sh' ? 'text-white' : 'text-slate-500 font-normal italic'}`}>
                  {activeOrder.salesManagerName && activeOrder.salesManagerName !== 'Bo\'sh' ? activeOrder.salesManagerName : "Bo'sh"}
                </span>
              </span>
              {activeOrder.salesManagerPhone && activeOrder.salesManagerPhone !== 'Bo\'sh' && (
                <span className="text-emerald-400 text-xs font-mono block mt-0.5">
                  {activeOrder.salesManagerPhone}
                </span>
              )}
            </div>
          </div>

        </div>

        {activeOrder.products.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Mahsulotlar tarkibi ({activeOrder.products.length} ta):
            </span>
            <div className="space-y-1.5">
              {activeOrder.products.map((item, idx) => (
                <div key={item.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0 gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 font-mono">{idx + 1}.</span>
                    <span className="font-medium text-slate-200 truncate">{item.name}</span>
                    <span className="text-slate-500 text-[11px]">({item.dimensions && item.dimensions !== 'Bo\'sh' ? item.dimensions : "Bo'sh"})</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-300 text-[11px] sm:text-xs pl-5 sm:pl-0">
                    {item.areaSqM > 0 ? `${item.areaSqM} kv.m` : "Bo'sh"} • {item.color && item.color !== 'Bo\'sh' ? item.color : "Bo'sh"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <button
            id="btn-open-warranty-pdf"
            type="button"
            onClick={() => setIsWarrantyOpen(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] min-h-[48px]"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Kafolat Taloni (PDF)</span>
          </button>

          <button
            id="btn-open-service-request"
            type="button"
            onClick={() => {
              setServiceModalMode('form');
              setIsServiceModalOpen(true);
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] min-h-[48px]"
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span>Servisga Murojaat Qilish</span>
          </button>
        </div>
      </motion.div>

      {tickets.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Sizning Servis Murojaatlaringiz ({tickets.length})</span>
            </h3>
          </div>
          <ServiceHistory tickets={tickets} onRefresh={loadTickets} />
        </div>
      )}

      <WarrantyModal
        order={activeOrder}
        isOpen={isWarrantyOpen}
        onClose={() => setIsWarrantyOpen(false)}
      />

      <ServiceRequestModal
        order={activeOrder}
        availableOrders={clientOrders}
        isOpen={isServiceModalOpen}
        initialMode={serviceModalMode}
        onClose={() => setIsServiceModalOpen(false)}
        onTicketCreated={loadTickets}
      />
    </div>
  );
};

// Yangi qator - fayl oxiriga Enter bosing
