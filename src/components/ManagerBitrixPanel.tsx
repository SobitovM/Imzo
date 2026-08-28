import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Search, 
  Filter, 
  Eye, 
  ExternalLink, 
  PlusCircle, 
  Layers, 
  MessageSquare, 
  Wrench, 
  CheckCheck, 
  UserCheck, 
  Sparkles, 
  Award, 
  RefreshCw, 
  FileText, 
  Code,
  Globe,
  Star,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, ServiceTicket } from '../types';
import { 
  getStoredOrders, 
  getStoredTickets, 
  saveStoredOrders,
  updateOrderStatus, 
  markSmsSent, 
  resolveServiceTicket, 
  updateTicketStatus,
  resetDemoData 
} from '../services/storage';
import { fetchBitrixRecentDeals, getBitrixWebhookUrl } from '../services/bitrixService';
import { SMSPreviewModal } from './SMSPreviewModal';
import { WarrantyModal } from './WarrantyModal';
import { NewOrderModal } from './NewOrderModal';
import { BitrixWebhookModal } from './BitrixWebhookModal';

interface ManagerBitrixPanelProps {
  onOpenClientCabinet: (order: Order) => void;
}

export const ManagerBitrixPanel: React.FC<ManagerBitrixPanelProps> = ({
  onOpenClientCabinet,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'analytics'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncingBitrix, setIsSyncingBitrix] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);
  
  // Modals
  const [smsOrder, setSmsOrder] = useState<Order | null>(null);
  const [warrantyOrder, setWarrantyOrder] = useState<Order | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isBitrixDocOpen, setIsBitrixDocOpen] = useState(false);

  // Ticket Resolution state
  const [resolvingTicket, setResolvingTicket] = useState<ServiceTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolverName, setResolverName] = useState('Jasur Mahmudov (Katta servis ustasi)');

  // 🔥 Admin panelda faqat 10 ta order ko'rsatish
  const DISPLAY_LIMIT = 10;

  const loadData = () => {
    setOrders(getStoredOrders());
    setTickets(getStoredTickets());
  };

  const handleSyncWithBitrix = async (silent: boolean = false) => {
    const webhook = getBitrixWebhookUrl();
    if (!webhook) {
      if (!silent) {
        setIsBitrixDocOpen(true);
      }
      return;
    }

    try {
      setIsSyncingBitrix(true);
      const bitrixDeals = await fetchBitrixRecentDeals(200);
      
      const currentStored = getStoredOrders();
      const manualOrders = currentStored.filter(o => !o.id.startsWith('bx_') && (!o.notes || !o.notes.includes('Bitrix24 Deal ID')));
      
      const newOrdersList = [...bitrixDeals, ...manualOrders];
      saveStoredOrders(newOrdersList);
      setOrders(newOrdersList);

      setSyncStatusText(`Bitrix24: ${bitrixDeals.length} ta mos keluvchi buyurtma yangilandi`);
      setTimeout(() => setSyncStatusText(null), 4000);
    } catch (err: any) {
      console.warn("Bitrix sync warning:", err);
      if (!silent) {
        setSyncStatusText(`Xatolik: ${err.message || 'Bitrix24 bilan bog\'lanishda xatolik'}`);
        setTimeout(() => setSyncStatusText(null), 5000);
      }
    } finally {
      setIsSyncingBitrix(false);
    }
  };

  useEffect(() => {
    loadData();
    if (getBitrixWebhookUrl()) {
      handleSyncWithBitrix(true);
    }

    // 🔥 Avtomatik yangilash O'CHIRILDI (faqat qo'lda)

    const handleOrders = () => setOrders(getStoredOrders());
    const handleTickets = () => setTickets(getStoredTickets());

    window.addEventListener('orders_updated', handleOrders);
    window.addEventListener('tickets_updated', handleTickets);

    return () => {
      window.removeEventListener('orders_updated', handleOrders);
      window.removeEventListener('tickets_updated', handleTickets);
    };
  }, []);

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    const updated = updateOrderStatus(order.id, newStatus, 'Alisher Rustamov (Bosh OKK Nazoratchisi)');
    if (updated) {
      if (newStatus === 'okk_otdi') {
        setSmsOrder(updated);
      }
      loadData();
    }
  };

  const handleSendSms = (order: Order) => {
    markSmsSent(order.id);
    setSmsOrder(order);
    loadData();
  };

  const handleResolveTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    resolveServiceTicket(
      resolvingTicket.id,
      resolverName,
      resolutionNotes || 'Muammo to\'liq bartaraf etildi, sozlash ishlari muvaffaqiyatli yakunlandi.',
      resolverName
    );

    setResolvingTicket(null);
    setResolutionNotes('');
    loadData();
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.clientFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientPhone.includes(searchQuery) ||
      o.showroomName.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  // 🔥 Faqat 10 ta order ko'rsatamiz
  const displayedOrders = filteredOrders.slice(0, DISPLAY_LIMIT);
  const totalOrders = filteredOrders.length;

  const pendingOkkCount = orders.filter((o) => o.status === 'kontrol_kachestva').length;
  const activeTicketsCount = tickets.filter((t) => t.status !== 'hal_qilindi').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Manager Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Bitrix24 & Sifat Nazorati Markazi
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Sifat Nazoratchisi: Alisher Rustamov
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              Buyurtmalar va Sifat Nazorati Boshqaruvi
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Buyurtmani <strong>"Sifat nazoratidan o'tdi"</strong> statusiga o'tkazish, mijozga avtomatik SMS & Login/Parol generatsiya qilish, hamda kelib tushgan servis murojaatlarini hal qilish tizimi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-bitrix-sync"
              onClick={() => handleSyncWithBitrix(false)}
              disabled={isSyncingBitrix}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingBitrix ? 'animate-spin' : ''}`} />
              <span>{isSyncingBitrix ? 'Bitrix24 yangilanmoqda...' : 'Bitrix24 Sinxronizatsiya'}</span>
            </button>

            <button
              id="btn-bitrix-docs"
              onClick={() => setIsBitrixDocOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 text-blue-300 text-xs font-bold rounded-xl border border-blue-500/40 shadow-sm transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Bitrix24 Sozlamalari</span>
            </button>

            <button
              id="btn-add-order"
              onClick={() => setIsNewOrderOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yangi Buyurtma Qo'shish</span>
            </button>
          </div>
        </div>

        {syncStatusText && (
          <div className="mt-3 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncStatusText}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Buyurtmalar & Sifat Nazorati ({totalOrders})</span>
            {totalOrders > DISPLAY_LIMIT && (
              <span className="text-[10px] text-slate-400 ml-1">
                (oxirgi {DISPLAY_LIMIT} ta)
              </span>
            )}
            {pendingOkkCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {pendingOkkCount} tekshiruvda
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Servis Murojaatlari ({tickets.length})</span>
            {activeTicketsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {activeTicketsCount} yangi
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Orders Management & OKK Verification */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mijoz ismi, schet yoki telefon..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'kontrol_kachestva', label: 'Sifat Tekshiruvida' },
                { id: 'okk_otdi', label: 'Sifat nazoratidan o\'tgan' },
                { id: 'ishlab_chiqarishda', label: 'Ishlab chiqarishda' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === filter.id
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards Grid - faqat 10 ta */}
          <div className="space-y-4">
            {displayedOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                {searchQuery ? 'Qidiruv bo\'yicha hech qanday buyurtma topilmadi' : 'Hozircha buyurtmalar mavjud emas'}
              </div>
            ) : (
              displayedOrders.map((order) => {
                const isOkkPassed = ['okk_otdi', 'yetkazib_berishda', 'topshirildi'].includes(order.status);
                const isPendingOkk = order.status === 'kontrol_kachestva';

                return (
                  <motion.div
                    key={order.id}
                    layout
                    className={`bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all ${
                      isPendingOkk
                        ? 'border-amber-500/40 shadow-lg shadow-amber-500/5 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Order Top Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20 text-xs">
                            {order.invoiceNumber}
                          </span>
                          
                          {isOkkPassed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sifat nazoratidan o'tgan
                            </span>
                          ) : isPendingOkk ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              Sifat Nazorati Tekshiruvi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              Ishlab chiqarishda
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            Sana: {order.orderDate && order.orderDate !== 'Bo\'sh' ? order.orderDate : "Bo'sh"}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {order.clientFullName && order.clientFullName !== 'Bo\'sh' ? order.clientFullName : "Bo'sh"}
                        </h3>
                        
                        <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>Tel: <strong className={`font-mono ${order.clientPhone && order.clientPhone !== 'Bo\'sh' ? 'text-slate-300' : 'text-slate-500 font-normal italic'}`}>
                            {order.clientPhone && order.clientPhone !== 'Bo\'sh' ? order.clientPhone : "Bo'sh"}
                          </strong></span>
                          <span>•</span>
                          <span>Showroom: <strong className={order.showroomName && order.showroomName !== 'Bo\'sh' ? 'text-slate-300' : 'text-slate-500 font-normal italic'}>
                            {order.showroomName && order.showroomName !== 'Bo\'sh' ? order.showroomName : "Bo'sh"}
                          </strong></span>
                          <span>•</span>
                          <span>Menejer: <strong className={order.salesManagerName && order.salesManagerName !== 'Bo\'sh' ? 'text-slate-300' : 'text-slate-500 font-normal italic'}>
                            {order.salesManagerName && order.salesManagerName !== 'Bo\'sh' ? order.salesManagerName : "Bo'sh"}
                          </strong></span>
                        </p>
                      </div>

                      {/* Quick Access Credentials Banner */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Mijoz Logini:</span>
                          <span className="font-bold text-white">{order.credentials.login}</span>
                        </div>
                        <div className="border-l border-slate-800 pl-4">
                          <span className="text-slate-500 text-[10px] block">SMS PIN:</span>
                          <span className="font-bold text-amber-400">{order.credentials.pinCode}</span>
                        </div>
                        <div className="border-l border-slate-800 pl-4">
                          <span className="text-slate-500 text-[10px] block">SMS Statusi:</span>
                          {order.smsSent ? (
                            <span className="text-emerald-400 font-sans font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCheck className="w-3.5 h-3.5" /> Yuborilgan
                            </span>
                          ) : (
                            <span className="text-amber-400 font-sans text-[11px]">Kutilmoqda</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Products Summary */}
                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <span className="text-slate-400 font-semibold block">Buyurtma qilingan mahsulotlar:</span>
                        {order.products.map((p) => (
                          <div key={p.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-200">{p.name}</p>
                              <p className="text-[11px] text-slate-400">
                                {p.model && p.model !== 'Bo\'sh' ? p.model : "Seriya: Bo'sh"} • {p.color && p.color !== 'Bo\'sh' ? p.color : "Rang: Bo'sh"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`font-mono font-semibold block ${p.areaSqM > 0 ? 'text-amber-300' : 'text-slate-500'}`}>
                                {p.areaSqM > 0 ? `${p.areaSqM} kv.m` : "Bo'sh"}
                              </span>
                              <span className="text-[11px] text-slate-400">{p.quantity} dona</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                        <span className="text-slate-400 font-semibold block">Sifat Nazorati parametri:</span>
                        <div className="flex justify-between text-slate-300 text-xs">
                          <span>Sifat nazorati muhandisi:</span>
                          <span className={`font-semibold ${order.warranty?.okkManagerName && order.warranty.okkManagerName !== 'Bo\'sh' ? 'text-white' : 'text-slate-500 font-normal italic'}`}>
                            {order.warranty?.okkManagerName && order.warranty.okkManagerName !== 'Bo\'sh' ? order.warranty.okkManagerName : "Bo'sh"}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-xs">
                          <span>Kafolat muddati:</span>
                          <span className="font-bold text-amber-400">{order.warranty?.warrantyPeriodMonths || 60} Oy (5 Yil)</span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-xs">
                          <span>Tayyor bo'lgan sana:</span>
                          <span className="font-mono text-emerald-400">{order.readyDate && order.readyDate !== 'Bo\'sh' ? order.readyDate : (order.status === 'okk_otdi' ? 'Tasdiqlangan' : "Bo'sh")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & OKK State Transition Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        {!isOkkPassed ? (
                          <button
                            id={`btn-pass-okk-${order.id}`}
                            onClick={() => handleStatusChange(order, 'okk_otdi')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Sifat nazoratidan o'tdi (Tasdiqlash & SMS yaratish)</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              id={`btn-send-sms-${order.id}`}
                              onClick={() => handleSendSms(order)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Mijozga SMS Yuborish / Ko'rish</span>
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setWarrantyOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Kafolat Taloni (PDF)</span>
                        </button>
                      </div>

                      <button
                        id={`btn-open-client-${order.id}`}
                        onClick={() => onOpenClientCabinet(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer group"
                      >
                        <span>Mijoz Kabinetida Ko'rish</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Service Requests CRM */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                Bitrix24 CRM Servis Voronkasi & Zayavkalar ({tickets.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mijozlar kabinetidan yuborilgan barcha servis arizalari real-vaqtda ushbu CRM voronkasiga tushadi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                Pipeline: SERVIS_WARRANTY_V1
              </span>
            </div>
          </div>

          {/* CRM Kanban Pipeline Voronkasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Stage 1: Yangi Ariza */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Yangi Arizalar
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold">
                  {tickets.filter(t => t.status === 'yangi').length}
                </span>
              </div>

              <div className="flex-1 py-3 space-y-3 overflow-y-auto max-h-[600px]">
                {tickets.filter(t => t.status === 'yangi').length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-6">
                    Yangi arizalar mavjud emas
                  </p>
                ) : (
                  tickets.filter(t => t.status === 'yangi').map(ticket => (
                    <div key={ticket.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-amber-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          {ticket.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{ticket.createdAt}</span>
                      </div>
                      <p className="text-xs font-bold text-white">{ticket.clientFullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Schet: {ticket.invoiceNumber}</p>
                      <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg line-clamp-2">
                        {ticket.problemDetails}
                      </p>
                      <div className="pt-1 flex gap-1.5">
                        <button
                          onClick={() => {
                            updateTicketStatus(ticket.id, 'jarayonda', 'Navbatchi menejer');
                            loadData();
                          }}
                          className="flex-1 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          → Jarayonga o'tkazish
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stage 2: Jarayonda */}
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Ko'rib Chiqilmoqda
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold">
                  {tickets.filter(t => t.status === 'jarayonda').length}
                </span>
              </div>

              <div className="flex-1 py-3 space-y-3 overflow-y-auto max-h-[600px]">
                {tickets.filter(t => t.status === 'jarayonda').length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-6">
                    Ushbu bosqichda zayavka yo'q
                  </p>
                ) : (
                  tickets.filter(t => t.status === 'jarayonda').map(ticket => (
                    <div key={ticket.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-blue-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                          {ticket.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{ticket.createdAt}</span>
                      </div>
                      <p className="text-xs font-bold text-white">{ticket.clientFullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Tel: {ticket.clientPhone}</p>
                      <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg line-clamp-2">
                        {ticket.problemDetails}
                      </p>
                      <div className="pt-1 flex gap-1.5">
                        <button
                          onClick={() => {
                            updateTicketStatus(ticket.id, 'usta_biriktirildi', 'Jasur Mahmudov (Katta Usta)');
                            loadData();
                          }}
                          className="flex-1 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          → Usta biriktirish
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stage 3: Usta Biriktirildi */}
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    3. Usta Biriktirilgan
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-mono font-bold">
                  {tickets.filter(t => t.status === 'usta_biriktirildi').length}
                </span>
              </div>

              <div className="flex-1 py-3 space-y-3 overflow-y-auto max-h-[600px]">
                {tickets.filter(t => t.status === 'usta_biriktirildi').length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-6">
                    Usta biriktirilgan zayavka yo'q
                  </p>
                ) : (
                  tickets.filter(t => t.status === 'usta_biriktirildi').map(ticket => (
                    <div key={ticket.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-purple-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">
                          {ticket.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{ticket.createdAt}</span>
                      </div>
                      <p className="text-xs font-bold text-white">{ticket.clientFullName}</p>
                      <p className="text-[10px] text-emerald-400 font-medium">Usta: {ticket.assignedSpecialist || 'Jasur Mahmudov'}</p>
                      <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg line-clamp-2">
                        {ticket.problemDetails}
                      </p>
                      <div className="pt-1 flex gap-1.5">
                        <button
                          onClick={() => {
                            setResolvingTicket(ticket);
                            setResolutionNotes('');
                          }}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Hal Qilish & Yopish</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stage 4: Hal Qilindi */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    4. Hal Qilindi (Yopilgan)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold">
                  {tickets.filter(t => t.status === 'hal_qilindi').length}
                </span>
              </div>

              <div className="flex-1 py-3 space-y-3 overflow-y-auto max-h-[600px]">
                {tickets.filter(t => t.status === 'hal_qilindi').length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-6">
                    Hozircha yopilgan zayavka yo'q
                  </p>
                ) : (
                  tickets.filter(t => t.status === 'hal_qilindi').map(ticket => (
                    <div key={ticket.id} className="p-3.5 bg-slate-950/70 rounded-xl border border-emerald-500/20 space-y-2 opacity-90 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                          {ticket.id}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">✓ {ticket.resolvedAt}</span>
                      </div>
                      <p className="text-xs font-bold text-white">{ticket.clientFullName}</p>
                      {ticket.resolutionNotes && (
                        <p className="text-[10px] text-slate-400 italic">
                          "{ticket.resolutionNotes}"
                        </p>
                      )}
                      {ticket.clientRating && (
                        <div className="flex items-center gap-1 text-amber-400 text-[10px] pt-1">
                          <span>Bahosi:</span>
                          <span className="font-bold">{ticket.clientRating}/5 ★</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Full Detailed List View Below Pipeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Batafsil Murojaatlar Ro'yxati
            </h4>
            {tickets.map((ticket) => {
              const isResolved = ticket.status === 'hal_qilindi';

              return (
                <div
                  key={ticket.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isResolved ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900 border-blue-500/40 shadow-lg shadow-blue-500/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs">
                        ID: {ticket.id}
                      </span>
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {ticket.clientFullName}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ({ticket.invoiceNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        Tel: <strong className="text-slate-200">{ticket.clientPhone}</strong>
                      </span>
                      {isResolved ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Hal qilindi
                        </span>
                      ) : ticket.status === 'usta_biriktirildi' ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Usta biriktirildi
                        </span>
                      ) : ticket.status === 'jarayonda' ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Jarayonda
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Yangi Murojaat
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-3 text-xs space-y-2">
                    <p className="text-slate-300">
                      <span className="text-slate-500 font-medium">Toifa: </span>
                      <strong className="text-white">{ticket.category}</strong>
                    </p>
                    <div className="p-3 rounded-lg bg-slate-950 text-slate-200 border border-slate-800">
                      {ticket.problemDetails}
                    </div>

                    {ticket.photoUrls && ticket.photoUrls.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {ticket.photoUrls.map((url, idx) => (
                          <img key={idx} src={url} alt="Problem proof" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    {isResolved ? (
                      <div className="text-xs text-slate-300 space-y-1">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>Hal qilgan mutaxassis: <strong>{ticket.resolvedByManager}</strong> ({ticket.resolvedAt})</span>
                        </div>
                        {ticket.resolutionNotes && (
                          <p className="text-slate-400 text-[11px] pl-6">
                            Xulosa: {ticket.resolutionNotes}
                          </p>
                        )}
                        {ticket.clientRating && (
                          <div className="flex items-center gap-1.5 pl-6 pt-1">
                            <span className="text-slate-400">Mijoz bahosi:</span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(ticket.clientRating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="font-bold text-amber-400">{ticket.clientRating}/5</span>
                            {ticket.clientFeedback && (
                              <span className="text-slate-300 italic text-[11px] ml-2">"{ticket.clientFeedback}"</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-slate-400">
                          Murojaat kelgan vaqti: {ticket.createdAt}
                        </span>
                        <button
                          id={`btn-resolve-ticket-${ticket.id}`}
                          onClick={() => {
                            setResolvingTicket(ticket);
                            setResolutionNotes('');
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Muammoni Hal Qilish & Yopish</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ticket Resolution Modal */}
      <AnimatePresence>
        {resolvingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-400" />
                  Servis Zayavkasini Hal Qilish (Yopish)
                </h3>
                <button
                  onClick={() => setResolvingTicket(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleResolveTicketSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mijoz va Buyurtma:
                  </label>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <strong>{resolvingTicket.clientFullName}</strong> ({resolvingTicket.invoiceNumber})
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Muammoni bartaraf etgan mutaxassis / usta:
                  </label>
                  <input
                    type="text"
                    required
                    value={resolverName}
                    onChange={(e) => setResolverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Bajarilgan ish va muammo xulosasi:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Masalan: Usta borib magnit qulfini sozlab berdi, nuqson to'liq bartaraf etildi..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300">
                  Zayavka "Hal qilindi" statusiga o'tkazilgandan so'ng, mijozning shaxsiy kabinetida xizmat sifatini baholash bildirishnomasi paydo bo'ladi.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolvingTicket(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/30"
                  >
                    Hal Qilindi deb Belgilash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <SMSPreviewModal
        order={smsOrder}
        isOpen={Boolean(smsOrder)}
        onClose={() => setSmsOrder(null)}
        onOpenClientCabinet={onOpenClientCabinet}
      />

      {warrantyOrder && (
        <WarrantyModal
          order={warrantyOrder}
          isOpen={Boolean(warrantyOrder)}
          onClose={() => setWarrantyOrder(null)}
        />
      )}

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={(newOrd) => {
          loadData();
          if (newOrd.status === 'okk_otdi') {
            setSmsOrder(newOrd);
          }
        }}
      />

      <BitrixWebhookModal
        isOpen={isBitrixDocOpen}
        onClose={() => setIsBitrixDocOpen(false)}
        onDataSynced={loadData}
      />
    </div>
  );
};
