import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, ExternalLink, Send, CheckCheck, Phone, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface SMSPreviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenClientCabinet: (order: Order) => void;
}

export const SMSPreviewModal: React.FC<SMSPreviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenClientCabinet,
}) => {
  if (!isOpen || !order) return null;

  const directLink = `${window.location.origin}/?token=${order.credentials.directToken}`;

  return (
    <AnimatePresence>
      <div 
        id="sms-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Smartphone Top Notch & Bar */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 text-center relative">
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>FABRIKA OKK (SMS)</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Qabul qiluvchi: {order.clientPhone}
            </p>
          </div>

          {/* SMS Chat Body */}
          <div className="p-5 bg-slate-950/90 space-y-4">
            <div className="text-center">
              <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-full font-mono">
                Bugun {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Simulated SMS Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-900/60 to-slate-800 border border-blue-500/30 rounded-2xl rounded-tl-none p-4 text-xs text-slate-100 space-y-3 shadow-lg"
            >
              <p className="leading-relaxed">
                Hurmatli <strong className="text-white">{order.clientFullName.split(' ')[0]}</strong>! Sizning <strong className="text-amber-300 font-mono">{order.invoiceNumber}</strong> raqamli buyurtmangiz OKK sifat nazoratidan muvaffaqiyatli o'tdi va tayyor bo'ldi.
              </p>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-700/80 space-y-1.5 font-mono text-[11px]">
                <div className="text-amber-300 font-bold">
                  🔗 Shaxsiy Kabinet va Kafolat Taloni:
                </div>
                <div className="text-blue-400 break-all underline text-[10px]">
                  {directLink}
                </div>
                <div className="pt-1 text-slate-300 flex justify-between border-t border-slate-800 mt-2">
                  <span>Login: <strong className="text-white">{order.credentials.login}</strong></span>
                  <span>Parol: <strong className="text-amber-300 font-bold">{order.credentials.pinCode}</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300">
                Ushbu havola orqali buyurtmangiz ma'lumotlari bilan tanishishingiz va rasmiy Kafolat talonini (PDF) yuklab olishingiz mumkin.
              </p>

              <div className="flex items-center justify-end gap-1 text-[10px] text-blue-300 font-mono">
                <span>Yetkazildi</span>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </motion.div>

            {/* Direct Open Button */}
            <div className="pt-2">
              <button
                id="btn-sms-open-cabinet"
                onClick={() => {
                  onClose();
                  onOpenClientCabinet(order);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>SMS Havolasi Orqali Kabinetga Kirish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
