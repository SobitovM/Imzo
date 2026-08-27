import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  PhoneCall, 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  Clock, 
  Headphones,
  FileCheck,
  MessageSquare,
  Package,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Order } from '../types';
import { createServiceTicket } from '../services/storage';

interface ServiceRequestModalProps {
  order: Order;
  availableOrders?: Order[];
  isOpen: boolean;
  initialMode?: 'options' | 'form';
  onClose: () => void;
  onTicketCreated: () => void;
}

const SERVICE_CATEGORIES = [
  'Eshik / Oyna furniturasini sozlash',
  'Magnit qulf yoki tutqich (ruchka) nosozligi',
  'Shovqin, qisilish yoki mayin yopilmaslik',
  'Qoplama yoki lak-bo\'yoq qatlami ko\'rigi',
  'Profil / Oyna germetikligi va rezina izolyatsiyasi',
  'O\'rnatishdan keyingi profilaktik ko\'rik',
  'Mebel tortma / petlya yoki fasad mexanizmini to\'g\'rilash',
  'Boshqa masalalar',
];

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  order,
  availableOrders = [order],
  isOpen,
  initialMode = 'options',
  onClose,
  onTicketCreated,
}) => {
  const [mode, setMode] = useState<'options' | 'form' | 'success'>(initialMode);
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [problemDetails, setProblemDetails] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(order.invoiceNumber);
  const [contactPhone, setContactPhone] = useState(order.clientPhone || '+998 ');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedInvoice, setSubmittedInvoice] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedInvoice(order.invoiceNumber);
      setContactPhone(order.clientPhone || '+998 ');
    }
  }, [isOpen, initialMode, order]);

  if (!isOpen) return null;

  // Selected order info
  const currentSelectedOrder = availableOrders.find(
    (o) => o.invoiceNumber.toUpperCase() === selectedInvoice.toUpperCase()
  ) || order;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUrls = Array.from(files).map((f) => URL.createObjectURL(f as Blob));
      setUploadedPhotos((prev) => [...prev, ...newUrls].slice(0, 4));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice.trim()) {
      setErrorMsg('Iltimos, servis talab qilinayotgan buyurtmaning Schet raqamini tanlang yoki yozing');
      return;
    }
    if (!problemDetails.trim()) {
      setErrorMsg('Iltimos, yuzaga kelgan muammoni batafsil bayon qiling');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      createServiceTicket(
        currentSelectedOrder,
        category,
        problemDetails,
        selectedInvoice.trim().toUpperCase(),
        contactPhone,
        uploadedPhotos
      );
      setSubmittedInvoice(selectedInvoice.trim().toUpperCase());
      setIsSubmitting(false);
      setMode('success');
      onTicketCreated();
    }, 500);
  };

  const handleReset = () => {
    setMode('options');
    setProblemDetails('');
    setUploadedPhotos([]);
    setErrorMsg('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="service-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-base font-bold text-white truncate">
                  Kafolatli Servis va Usta Tashrifi
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  {order.clientFullName}
                </p>
              </div>
            </div>
            <button
              id="btn-close-service-modal"
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-3.5 sm:p-6 overflow-y-auto flex-1">
            {/* Mode 1: Selection (Call Center OR Online Ticket) */}
            {mode === 'options' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-300">
                  Hurmatli <strong>{order.clientFullName}</strong>, kafolat davrida barcha servis xizmatlari va profilaktika mutlaqo bepul ko'rsatiladi. O'zingizga qulay aloqa turini tanlang:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Call Center Card */}
                  <a
                    id="btn-call-center"
                    href="tel:+998712008800"
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-center group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-emerald-300">
                      Call Markazga Qo'ng'iroq
                    </span>
                    <span className="text-xs text-emerald-400 font-mono mt-1 font-semibold">
                      +998 (71) 200-88-00
                    </span>
                    <span className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      24/7 Navbatchi operatorlar
                    </span>
                  </a>

                  {/* Online Ticket Card */}
                  <button
                    id="btn-open-service-form"
                    onClick={() => setMode('form')}
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400 transition-all text-center group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-blue-200">
                      Onlayn Zayavka Qoldirish
                    </span>
                    <span className="text-xs text-slate-300 mt-1">
                      Buyurtma schetini ko'rsatgan holda
                    </span>
                    <span className="text-[11px] text-blue-300 mt-2 flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-blue-400" />
                      15 daqiqa ichida usta biriktiriladi
                    </span>
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5 mt-2">
                  <Headphones className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Agar hisobingizda bir nechta buyurtma (eshiklar, romlar, mebellar) bo'lsa, zayavka shaklida qaysi schet bo'yicha usta kerakligini tanlashingiz yoki yozishingiz mumkin.
                  </span>
                </div>
              </div>
            )}

            {/* Mode 2: Online Ticket Form */}
            {mode === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Schet Tanlash / Schet Raqami */}
                <div className="p-3.5 bg-slate-950 border border-blue-500/30 rounded-xl space-y-2.5">
                  <label className="block text-xs font-bold text-blue-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      Qaysi buyurtmangiz bo'yicha servis kerak? (Schet raqami):
                    </span>
                    <span className="text-[10px] text-amber-400 font-normal">Majburiy</span>
                  </label>

                  {/* Dropdown if available orders exist */}
                  {availableOrders.length > 1 && (
                    <div className="relative">
                      <select
                        id="select-order-invoice"
                        value={selectedInvoice}
                        onChange={(e) => setSelectedInvoice(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                      >
                        {availableOrders.map((ord) => (
                          <option key={ord.id} value={ord.invoiceNumber}>
                            {ord.invoiceNumber} — {ord.products[0]?.name || 'Mahsulot'} ({ord.warranty?.warrantyPeriodMonths || 36} oy kafolat)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Input to write or fine-tune exact schet number */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        id="input-invoice-number"
                        type="text"
                        value={selectedInvoice}
                        onChange={(e) => setSelectedInvoice(e.target.value.toUpperCase())}
                        placeholder="Masalan: SCH-2026-8841"
                        required
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold uppercase focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      Schet raqami
                    </span>
                  </div>

                  {/* Selected product preview info */}
                  {currentSelectedOrder && currentSelectedOrder.products.length > 0 && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-300 font-medium">Mahsulot: </span>
                      {currentSelectedOrder.products.map(p => p.name).join(', ')} ({currentSelectedOrder.products[0]?.model || ''})
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Buyurtmachi Ism-familiyasi
                    </label>
                    <input
                      id="input-client-name"
                      type="text"
                      disabled
                      value={order.clientFullName}
                      className="w-full px-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bog'lanish uchun telefon raqami
                    </label>
                    <input
                      id="input-service-phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Muammo toifasi
                  </label>
                  <select
                    id="select-service-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Muammo haqida batafsil ma'lumot</span>
                    <span className="text-[10px] text-slate-500 font-normal">Majburiy maydon</span>
                  </label>
                  <textarea
                    id="textarea-problem-details"
                    rows={3}
                    value={problemDetails}
                    onChange={(e) => setProblemDetails(e.target.value)}
                    placeholder="Masalan: Ushbu buyurtma bo'yicha eshik magnit qulfi sozlanishi kerak yoki tutqichi biroz bo'shashgan..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                {/* Optional Photo Attachment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nuqson yoki holat rasmini yuklash (ixtiyoriy)
                  </label>
                  <label 
                    htmlFor="service-photo-input"
                    className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-slate-500 rounded-lg bg-slate-950/40 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-400">
                      Rasm tanlash yoki bu yerga tortib qo'yish
                    </span>
                    <input
                      id="service-photo-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {uploadedPhotos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {uploadedPhotos.map((url, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700">
                          <img src={url} alt={`Yuklangan rasm ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('options')}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Orqaga
                  </button>

                  <button
                    id="btn-submit-service-ticket"
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Jo\'natilmoqda...' : 'Zayavkani Jo\'natish'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Mode 3: Success Confirmation */}
            {mode === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-white">
                    Servis zayavkasi muvaffaqiyatli qabul qilindi!
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Tez orada servis bo'limi muhandisi siz bilan bog'lanadi va usta tashrifi vaqtini muvofiqlashtiradi.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Belgilangan Schet raqami:</span>
                    <span className="font-mono font-bold text-amber-300">{submittedInvoice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CRM Voronkasi holati:</span>
                    <span className="text-emerald-400 font-semibold">1. Yangi Ariza (Bitrix24 CRM ga tushdi)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kafolat bo'yicha to'lov:</span>
                    <span className="text-emerald-400 font-bold">0 so'm (Mutlaqo Bepul)</span>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    id="btn-finish-service-modal"
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Kabinetga qaytish
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
