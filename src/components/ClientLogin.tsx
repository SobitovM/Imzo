import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  KeyRound, 
  Lock, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  Loader2,
  Globe
} from 'lucide-react';
import { Order } from '../types';
import { getStoredOrders, normalizePhone, saveStoredOrders } from '../services/storage';
import { fetchBitrixCustomerOrdersByCredentials, getBitrixWebhookUrl } from '../services/bitrixService';
import { ImzoLogo } from './ImzoLogo';

interface ClientLoginProps {
  onLoginSuccess: (order: Order) => void;
  onSwitchToManager: () => void;
}

export const ClientLogin: React.FC<ClientLoginProps> = ({
  onLoginSuccess,
  onSwitchToManager,
}) => {
  const [loginInput, setLoginInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasBitrixUrl, setHasBitrixUrl] = useState(false);

  useEffect(() => {
    const loaded = getStoredOrders();
    setOrders(loaded);
    setHasBitrixUrl(Boolean(getBitrixWebhookUrl()));

    // Check if URL has direct token query param
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      const match = loaded.find((o) => o.credentials.directToken === token);
      if (match) {
        onLoginSuccess(match);
      }
    }
  }, [onLoginSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanLogin = loginInput.trim().toUpperCase();
    const cleanPin = pinInput.trim();
    const loginDigits = normalizePhone(loginInput);

    // 1. First, check local storage orders
    const all = getStoredOrders();
    const matchedLocal = all.find((o) => {
      const oDigits = normalizePhone(o.clientPhone);
      const matchesPhone = loginDigits.length >= 7 && (oDigits.endsWith(loginDigits) || loginDigits.endsWith(oDigits));
      const matchesLogin = o.credentials.login.toUpperCase() === cleanLogin;
      const matchesInvoice = o.invoiceNumber.toUpperCase() === cleanLogin;
      const matchesPin = o.credentials.pinCode === cleanPin || o.credentials.pinCode.toUpperCase() === cleanPin.toUpperCase();

      return (matchesPhone || matchesLogin || matchesInvoice || !cleanLogin) && matchesPin;
    });

    if (matchedLocal) {
      setIsLoading(false);
      onLoginSuccess(matchedLocal);
      return;
    }

    // 2. If not found locally, execute Live Bitrix24 REST query (for GitHub, Render or direct server)
    const webhookUrl = getBitrixWebhookUrl();
    if (webhookUrl) {
      try {
        const bitrixAuth = await fetchBitrixCustomerOrdersByCredentials(loginInput, pinInput);
        if (bitrixAuth && bitrixAuth.allOrders.length > 0) {
          // Merge all returned deals for this customer into local storage
          const newIds = new Set(bitrixAuth.allOrders.map(o => o.id));
          const updatedList = [...bitrixAuth.allOrders, ...all.filter(o => !newIds.has(o.id))];
          saveStoredOrders(updatedList);

          setIsLoading(false);
          onLoginSuccess(bitrixAuth.mainOrder);
          return;
        }
      } catch (bitrixErr: any) {
        console.warn("Live Bitrix24 auth check notice:", bitrixErr);
      }
    }

    setIsLoading(false);
    setErrorMsg('Telefon raqam yoki maxsus parol noto\'g\'ri kiritildi. Bitrix24 dagi SMS maxsus kod (UF_CRM_1745308434) ni tekshiring.');
  };

  const handleQuickLogin = (order: Order) => {
    setLoginInput(order.clientPhone || order.credentials.login);
    setPinInput(order.credentials.pinCode);
    setErrorMsg('');
    onLoginSuccess(order);
  };

  // Group unique clients for quick demo preview
  const uniqueClientMap = new Map<string, { mainOrder: Order; orderCount: number; invoices: string[] }>();
  orders.forEach((o) => {
    const key = o.clientPhone.replace(/\D/g, '') || o.clientFullName;
    if (!uniqueClientMap.has(key)) {
      uniqueClientMap.set(key, { mainOrder: o, orderCount: 1, invoices: [o.invoiceNumber] });
    } else {
      const cur = uniqueClientMap.get(key)!;
      cur.orderCount += 1;
      cur.invoices.push(o.invoiceNumber);
    }
  });
  const clientGroups = Array.from(uniqueClientMap.values());

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo / Brand Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="flex justify-center pb-1">
            <ImzoLogo size="xl" className="h-12 sm:h-14" />
          </div>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
            Mijoz Shaxsiy Kabineti
          </h2>
        </div>
        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Telefon Raqami (Login)</span>
              <span className="text-[10px] text-slate-500 font-mono">+998 90 123 45 67</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-4 h-4 text-blue-400" />
              </div>
              <input
                id="input-client-login"
                type="tel"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="+998 90 123 45 67 yoki 901234567"
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Maxsus Parol (SMS PIN Kod)</span>
              <span className="text-[10px] text-amber-400 font-mono">UF_CRM_1745308434</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <input
                id="input-client-pin"
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Maxsus kod (masalan: 8841)..."
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono tracking-wider"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            id="btn-submit-client-login"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-h-[46px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Bitrix24 tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <span>Kabinetga Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Section */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Namunaviy Hisoblar (1 bosishda kirish):
            </span>
          </div>

          <div className="space-y-1.5">
            {clientGroups.map((grp) => (
              <button
                key={grp.mainOrder.id}
                type="button"
                onClick={() => handleQuickLogin(grp.mainOrder)}
                className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                      {grp.mainOrder.clientFullName}
                    </span>
                    {grp.orderCount > 1 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        {grp.orderCount} ta buyurtma
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    Login: <strong className="text-slate-200">{grp.mainOrder.credentials.login}</strong> | PIN: <strong className="text-amber-300">{grp.mainOrder.credentials.pinCode}</strong>
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Kirish</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Switch to Manager */}
        <div className="pt-2 text-center relative z-10">
          <button
            type="button"
            onClick={onSwitchToManager}
            className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Menejer yoki Sifat nazoratchisimiz? <strong className="text-blue-400 underline">Sifat Nazorati Paneliga o'tish</strong>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
