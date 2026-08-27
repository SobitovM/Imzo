import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, X, CheckCircle2, Package, User, Building2, Layers, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { INITIAL_SHOWROOMS, INITIAL_MANAGERS } from '../data/mockData';
import { createNewOrder } from '../services/storage';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+998 90 ');
  const [clientAddress, setClientAddress] = useState('Toshkent shahar, Mirzo Ulug\'bek tumani');
  const [showroomId, setShowroomId] = useState(INITIAL_SHOWROOMS[0].id);
  const [salesManagerName, setSalesManagerName] = useState(INITIAL_MANAGERS[0].name);
  
  // Product info
  const [productName, setProductName] = useState('Termo 57');
  const [model, setModel] = useState('Termo 57 Alyumin Konstruksiya');
  const [color, setColor] = useState('7016 Матовый (Tiger)');
  const [areaSqM, setAreaSqM] = useState<number>(18.5);
  const [dimensions, setDimensions] = useState('2200 x 1800 mm');
  const [quantity, setQuantity] = useState<number>(3);
  const [unitPrice, setUnitPrice] = useState<number>(4200000);
  const [initialStatus, setInitialStatus] = useState<OrderStatus>('kontrol_kachestva');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const showroom = INITIAL_SHOWROOMS.find((s) => s.id === showroomId) || INITIAL_SHOWROOMS[0];
    const total = quantity * unitPrice;

    const newOrder = createNewOrder({
      clientFullName: clientName,
      clientPhone,
      clientAddress,
      showroomName: showroom.name,
      showroomId: showroom.id,
      salesManagerName,
      status: initialStatus,
      products: [
        {
          id: `p-${Date.now()}`,
          name: productName,
          category: 'Mebel / Eshik mahsulotlari',
          model,
          color,
          areaSqM: Number(areaSqM) || 12,
          dimensions,
          quantity: Number(quantity) || 1,
          unitPrice: Number(unitPrice) || 3000000,
          totalPrice: total,
        },
      ],
      totalAmount: total,
      paidAmount: total,
    });

    onOrderCreated(newOrder);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="new-order-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Yangi Buyurtma Kiritish (Bitrix CRM / Fabrika)
                </h3>
                <p className="text-xs text-slate-400">
                  Mijoz ma'lumotlari va ishlab chiqarish parametrlarini to'ldiring
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Section 1: Client & Showroom */}
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-blue-400">
                <User className="w-4 h-4" />
                Mijoz va Showroom Ma'lumotlari
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mijoz Ism-familiyasi *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Masalan: Qodirov Jamshid"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefon raqami (SMS uchun) *</label>
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Showroom Filiali</label>
                  <select
                    value={showroomId}
                    onChange={(e) => setShowroomId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {INITIAL_SHOWROOMS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mas'ul Sotuv Menejeri</label>
                  <select
                    value={salesManagerName}
                    onChange={(e) => setSalesManagerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {INITIAL_MANAGERS.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Product Specs */}
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-400">
                <Package className="w-4 h-4" />
                Mahsulot Parametrlari (kv.m va rangi)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mahsulot Nomi</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model / Seriya</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rangi / Qoplamasi</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Maydoni (kv.m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={areaSqM}
                    onChange={(e) => setAreaSqM(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">O'lchamlari</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Soni (dona)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Birlik Narxi (so'm)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dastlabki Status</label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="ishlab_chiqarishda">Ishlab chiqarishda</option>
                    <option value="kontrol_kachestva">Kontrol kachestva (OKK)</option>
                    <option value="okk_otdi">Заказ прошел ОКК (Tayyor)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-slate-300 font-medium">
                Jami qiymati: <strong className="text-white font-mono text-sm font-bold">{(quantity * unitPrice).toLocaleString('uz-UZ')} so'm</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-600/30 transition-colors"
                >
                  Buyurtmani Saqlash
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
