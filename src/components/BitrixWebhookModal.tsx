import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Globe, 
  Send, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Layers,
  ArrowRight,
  Loader2,
  Building2,
  Search,
  Download,
  FileJson,
  ExternalLink
} from 'lucide-react';
import { 
  getBitrixWebhookUrl, 
  setBitrixWebhookUrl, 
  fetchBitrixRecentDeals,
  callBitrixMethod,
  parseRawBitrixJsonData
} from '../services/bitrixService';
import { 
  PRODUCTS_DICT, 
  COLORS_DICT, 
  SHOWROOMS_DICT,
  STAGE_NAMES, 
  BITRIX_FIELDS 
} from '../services/bitrixConfig';
import { saveStoredOrders, getStoredOrders } from '../services/storage';

interface BitrixWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced?: () => void;
}

export const BitrixWebhookModal: React.FC<BitrixWebhookModalProps> = ({ 
  isOpen, 
  onClose,
  onDataSynced
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'json_import' | 'showrooms' | 'dicts' | 'docs'>('connect');
  const [webhookUrl, setWebhookUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; dealsCount?: number } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showroomSearch, setShowroomSearch] = useState('');
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [jsonImportResult, setJsonImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWebhookUrlInput(getBitrixWebhookUrl());
      setTestResult(null);
      setJsonImportResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) {
      setTestResult({ success: false, message: "Iltimos, Bitrix24 Webhook URL havolasini kiriting." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setBitrixWebhookUrl(webhookUrl);

    try {
      // Test 1: Fetch recent deals
      const deals = await fetchBitrixRecentDeals(30);
      
      if (deals.length > 0) {
        // Save these real deals to local storage so the dashboard immediately shows them!
        const existing = getStoredOrders();
        // Merge without duplicating
        const dealIds = new Set(deals.map(d => d.id));
        const merged = [...deals, ...existing.filter(e => !dealIds.has(e.id))];
        saveStoredOrders(merged);
        if (onDataSynced) onDataSynced();

        setTestResult({
          success: true,
          message: `Bitrix24 ga ulanish muvaffaqiyatli! ${deals.length} ta real buyurtma (deal) yuklab olindi va kabinetga bog'landi.`,
          dealsCount: deals.length,
        });
      } else {
        setTestResult({
          success: true,
          message: "Bitrix24 ga ulanish muvaffaqiyatli, lekin hali birorta bitim topilmadi.",
          dealsCount: 0,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Bitrix24 ga ulanishda xatolik yuz berdi. Webhook URL to'g'riligini tekshiring.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleImportJson = () => {
    if (!rawJsonInput.trim()) {
      setJsonImportResult({ success: false, message: "Iltimos, Bitrix24 dan olingan JSON matnini joylashtiring." });
      return;
    }

    try {
      const deals = parseRawBitrixJsonData(rawJsonInput);
      if (deals.length === 0) {
        setJsonImportResult({ success: false, message: "JSON ichida birorta ham bitim (deal) topilmadi. Formatni tekshiring." });
        return;
      }

      const existing = getStoredOrders();
      const dealIds = new Set(deals.map(d => d.id));
      const merged = [...deals, ...existing.filter(e => !dealIds.has(e.id))];
      saveStoredOrders(merged);
      if (onDataSynced) onDataSynced();

      setJsonImportResult({
        success: true,
        message: `🎉 Ajoyib! Bitrix24 dan ${deals.length} ta haqiqiy buyurtma muvaffaqiyatli import qilindi va saqlandi!`,
        count: deals.length,
      });
    } catch (err: any) {
      setJsonImportResult({
        success: false,
        message: `JSON o'qishda xatolik: ${err.message}. Iltimos brauzeringizdagi butun JSON matnini nusxalab qo'ying.`
      });
    }
  };

  const BITRIX_REST_CODE = `// Bitrix24 Deal o'zgarganda avtomatik SMS yuborish va Kabinet PIN yaratish (Node.js)
app.post('/api/bitrix/order-status-changed', async (req, res) => {
  const { event, data } = req.body;
  const dealId = data.FIELDS.ID;
  const stageId = data.FIELDS.STAGE_ID; // Masalan: "C27:WON" yoki "C27:UC_B2NTSZ" (Заказ готов)

  // 1. Bitrix24 dan buyurtmani o'qish
  const deal = await bitrix.call('crm.deal.get', { id: dealId });
  const contact = deal.CONTACT_ID ? await bitrix.call('crm.contact.get', { id: deal.CONTACT_ID }) : null;
  
  // 2. UF_CRM_1745308434 maxsus PIN kodini olish yoki yaratish
  const pin = deal.UF_CRM_1745308434 || Math.floor(1000 + Math.random() * 9000).toString();
  const login = 'SCH' + dealId;
  const token = 'tok_' + login.toLowerCase() + '_' + dealId;
  
  // 3. Eskiz.uz / PlayMobile orqali mijozga SMS jo'natish
  const cabinetUrl = \`https://kabinet.fabrika.uz/?token=\${token}\`;
  const smsText = \`Hurmatli \${contact?.NAME || 'Mijoz'}! Sizning \${deal.TITLE} buyurtmangiz tayyor bo'ldi. Kafolat taloni va kabinet: \${cabinetUrl} Login: \${login} Parol: \${pin}\`;
  
  if (contact?.PHONE?.[0]?.VALUE) {
    await sendEskizSms({
      mobile_phone: contact.PHONE[0].VALUE,
      message: smsText
    });
  }

  // 4. Bitrix24 ga qaytarib yozish
  await bitrix.call('crm.deal.update', {
    id: dealId,
    fields: {
      UF_CRM_1745308434: pin,
      UF_CRM_1682760962387: new Date().toISOString() // "Заказ готов" vaqti
    }
  });

  res.json({ success: true });
});`;

  return (
    <AnimatePresence>
      <div 
        id="bitrix-webhook-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Bitrix24 Real Integratsiya & Maydonlar
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    Live REST API
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Bitrix24 Webhook URL orqali haqiqiy bitimlar va statuslarni to'g'ridan-to'g'ri o'qish
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 sm:px-6 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('connect')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'connect'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              1. Webhook Ulash & Sinov
            </button>
            <button
              onClick={() => setActiveTab('json_import')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'json_import'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              2. 📥 Tezkor JSON Import
            </button>
            <button
              onClick={() => setActiveTab('showrooms')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'showrooms'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              3. Showroomlar ({Object.keys(SHOWROOMS_DICT).length} ta)
            </button>
            <button
              onClick={() => setActiveTab('dicts')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'dicts'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              4. Maxsulotlar va Ranglar ({Object.keys(PRODUCTS_DICT).length} ta)
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              5. Avtomatizatsiya Kodingiz
            </button>
          </div>

          {/* Tab 1: Connect & Test */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {activeTab === 'connect' && (
              <div className="space-y-5">
                <form onSubmit={handleSaveAndTest} className="space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Bitrix24 Inbound Webhook URL:</span>
                      <span className="text-[10px] text-blue-400 font-mono">crm.deal.list ruxsati bilan</span>
                    </label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrlInput(e.target.value)}
                      placeholder="https://kompaniya.bitrix24.uz/rest/1/xxxxxxxxxxxx/"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Bitrix24 menyusidan: <strong>Разработчикам → Другое → Входящий вебхук</strong> bo'limidan havola olinadi (Ruxsatlar: CRM).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isTesting}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-h-[42px]"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Bitrix24 bilan bog'lanilmoqda...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Ulanishni Saqlash va Buyurtmalarni Yuklash</span>
                        </>
                      )}
                    </button>

                    {webhookUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setBitrixWebhookUrl('');
                          setWebhookUrlInput('');
                          setTestResult(null);
                        }}
                        className="px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        O'chirish
                      </button>
                    )}
                  </div>
                </form>

                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    )}
                    <div className="text-xs space-y-1">
                      <p className="font-bold">{testResult.message}</p>
                      {testResult.success && (
                        <p className="text-emerald-400/80">
                          Endi mijozlar o'zlarining maxsus PIN kodi ({BITRIX_FIELDS.SPECIAL_CODE}) yoki schet raqami orqali kabinetga to'g'ridan-to'g'ri kira oladilar!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Mapped Fields Quick Overview */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ushbu ilova taniy oladigan Bitrix24 maydonlari:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">PIN / SMS Kirish kodi:</span>
                      <strong className="text-amber-400 font-mono">{BITRIX_FIELDS.SPECIAL_CODE}</strong>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Buyurtma / Schet raqami:</span>
                      <strong className="text-blue-400 font-mono">{BITRIX_FIELDS.ORDER_INVOICE_ID}</strong>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Mahsulot seriyasi (ID):</span>
                      <strong className="text-emerald-400 font-mono">{BITRIX_FIELDS.PRODUCT_SERIES}</strong>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Profil rangi (ID):</span>
                      <strong className="text-purple-400 font-mono">{BITRIX_FIELDS.COLOR}</strong>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Kvadratura (m²):</span>
                      <strong className="text-cyan-400 font-mono">{BITRIX_FIELDS.AREA_SQM}</strong>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Fabrika & Tayyor bo'lish vaqti:</span>
                      <strong className="text-slate-200 font-mono">{BITRIX_FIELDS.FACTORY_DATE} / {BITRIX_FIELDS.ESTIMATED_READY_DATE}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Instant JSON Import */}
            {activeTab === 'json_import' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    Brauzeringizdagi Bitrix24 JSON ma'lumotlarini 1 soniyada yuklang
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Siz brauzeringizda Bitrix24 Webhook havolasini ochganingizda paydo bo'lgan JSON ma'lumotlarni nusxalab quyidagi maydonga tashlang. Tizim barcha <strong>Showroom nomlari, Mahsulot seriyalari, Ranglari, PIN kodlari va Kafolatlarini</strong> avtomatik moslashtirib saqlaydi!
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <a
                      href="https://bitrix.imzo.uz/rest/244/lhfi8leh3yqxl3sc/crm.deal.list.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-mono font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      crm.deal.list.json ni yangi oynada ochish
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    Bitrix24 dan olingan JSON matnini bu yerga joylashtiring (Paste):
                  </label>
                  <textarea
                    rows={8}
                    value={rawJsonInput}
                    onChange={(e) => setRawJsonInput(e.target.value)}
                    placeholder={`{\n  "result": [\n    {\n      "ID": "12345",\n      "TITLE": "Deal 12345",\n      "STAGE_ID": "C22:WON",\n      "OPPORTUNITY": "18500000",\n      "UF_CRM_1745308434": "8841",\n      "UF_CRM_1651306406137": "SCH-9942",\n      ...\n    }\n  ]\n}`}
                    className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleImportJson}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 JSON dagi Barcha Bitimlarni Yuklash (Import)</span>
                  </button>

                  {rawJsonInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setRawJsonInput('');
                        setJsonImportResult(null);
                      }}
                      className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Tozalash
                    </button>
                  )}
                </div>

                {jsonImportResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      jsonImportResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {jsonImportResult.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    )}
                    <div className="text-xs space-y-1">
                      <p className="font-bold">{jsonImportResult.message}</p>
                      {jsonImportResult.success && (
                        <p className="text-emerald-400/80">
                          Barcha ma'lumotlar OKK paneli va Mijoz shaxsiy kabinetiga muvaffaqiyatli saqlandi!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Tab 2: Showrooms List & Search */}
            {activeTab === 'showrooms' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={showroomSearch}
                      onChange={(e) => setShowroomSearch(e.target.value)}
                      placeholder="Showroom nomi yoki ID raqami bo'yicha qidirish..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2 shrink-0">
                    <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      Jami: {Object.keys(SHOWROOMS_DICT).length} ta Showroom
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[55vh] overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  {Object.entries(SHOWROOMS_DICT)
                    .filter(([id, name]) => {
                      if (!showroomSearch) return true;
                      const q = showroomSearch.toLowerCase();
                      return name.toLowerCase().includes(q) || String(id).includes(q);
                    })
                    .map(([id, name]) => (
                      <div 
                        key={id} 
                        className="p-2.5 bg-slate-900/80 hover:bg-slate-800/80 transition-colors rounded-lg border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="text-xs text-slate-200 font-medium truncate" title={name}>
                            {name}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px] font-bold shrink-0 border border-slate-700">
                          #{id}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tab 3: Dictionaries */}
            {activeTab === 'dicts' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
                    <span>Mahsulotlar katalogi ({Object.keys(PRODUCTS_DICT).length} ta ID)</span>
                    <span className="text-[10px] text-slate-400 font-mono">{BITRIX_FIELDS.PRODUCT_SERIES}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                    {Object.entries(PRODUCTS_DICT).map(([id, name]) => (
                      <div key={id} className="text-[11px] p-1.5 bg-slate-900/80 rounded border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-300 font-medium truncate pr-1">{name}</span>
                        <span className="text-amber-400 font-mono text-[10px] shrink-0">#{id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
                    <span>Ranglar ro'yxati ({Object.keys(COLORS_DICT).length} ta ID)</span>
                    <span className="text-[10px] text-slate-400 font-mono">{BITRIX_FIELDS.COLOR}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                    {Object.entries(COLORS_DICT).map(([id, name]) => (
                      <div key={id} className="text-[11px] p-1.5 bg-slate-900/80 rounded border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-300 font-medium truncate pr-1">{name}</span>
                        <span className="text-blue-400 font-mono text-[10px] shrink-0">#{id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-2">
                    Voronkalar & Bosqichlar (STAGE_ID lar)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px]">
                    {Object.entries(STAGE_NAMES).slice(0, 16).map(([stId, stName]) => (
                      <div key={stId} className="p-1.5 bg-slate-900/80 rounded border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-300 truncate pr-1">{stName}</span>
                        <span className="text-emerald-400 font-mono text-[10px] shrink-0">{stId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Automation Code */}
            {activeTab === 'docs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Bitrix24 Webhook / Node.js Robot Kodingiz:
                  </span>
                  <button
                    onClick={() => copyToClipboard(BITRIX_REST_CODE, 1)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? "Nusxalandi!" : "Kodni Nusxalash"}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre>{BITRIX_REST_CODE}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/70 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
