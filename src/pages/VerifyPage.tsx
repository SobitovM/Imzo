import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { getStoredOrders } from '../services/storage';
import { ImzoLogo } from '../components/ImzoLogo';

export const VerifyPage: React.FC = () => {
  const { certNumber } = useParams<{ certNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingMonths, setRemainingMonths] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (!certNumber) {
      setError('Sertifikat raqami topilmadi');
      setLoading(false);
      return;
    }

    const orders = getStoredOrders();
    const foundOrder = orders.find(o => 
      o.warranty?.certificateNumber === certNumber
    );

    if (foundOrder) {
      setOrder(foundOrder);
      
      const startDate = foundOrder.warranty?.orderDate || foundOrder.orderDate;
      const totalMonths = foundOrder.warranty?.warrantyPeriodMonths || 60;
      
      if (startDate && startDate !== "Bo'sh") {
        const start = new Date(startDate);
        const now = new Date();
        const monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        const remaining = Math.max(0, totalMonths - monthsPassed);
        setRemainingMonths(Math.floor(remaining));
        setIsValid(remaining > 0);
      } else {
        setRemainingMonths(totalMonths);
        setIsValid(true);
      }
      
      setLoading(false);
    } else {
      setError('Bu sertifikat raqamiga ega kafolat topilmadi');
      setLoading(false);
    }
  }, [certNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Kafolat tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Kafolat Tasdiqlanmadi</h2>
          <p className="text-slate-400 text-sm">{error || 'Sertifikat raqami noto\'g\'ri'}</p>
          <p className="text-slate-500 text-xs mt-4">Sertifikat raqami: {certNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <ImzoLogo size="lg" className="h-10" />
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isValid ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
            <ShieldCheck className={`w-4 h-4 ${isValid ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className={`text-xs font-bold ${isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isValid ? '✅ Kafolat Tasdiqlangan' : '⚠️ Kafolat Muddati Tugagan'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-3">Kafolat Taloni</h1>
          <p className="text-sm text-slate-400 font-mono">{certNumber}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Buyurtmachi:</span>
            <span className="text-white font-semibold">{order.clientFullName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Schet raqami:</span>
            <span className="text-white font-mono font-bold">{order.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Mahsulot:</span>
            <span className="text-white text-right max-w-[200px]">{order.products.map(p => p.name).join(', ')}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Showroom:</span>
            <span className="text-white">{order.showroomName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Kafolat muddati:</span>
            <span className="text-amber-400 font-bold">{order.warranty?.warrantyPeriodMonths || 60} oy (5 yil)</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Boshlanish sanasi:</span>
            <span className="text-white">{order.warranty?.orderDate || order.orderDate}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300 text-sm font-medium">Qolgan kafolat muddati:</span>
            </div>
            <div className="text-right">
              {isValid ? (
                <>
                  <span className="text-2xl font-bold text-emerald-400">{remainingMonths}</span>
                  <span className="text-sm text-slate-400 ml-1">oy</span>
                  <p className="text-[10px] text-slate-500">
                    ({Math.floor(remainingMonths / 12)} yil {remainingMonths % 12} oy)
                  </p>
                </>
              ) : (
                <span className="text-amber-400 font-bold">Muddati tugagan</span>
              )}
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${isValid ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, (remainingMonths / (order.warranty?.warrantyPeriodMonths || 60)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          <p>Sertifikat raqami: <span className="text-slate-400 font-mono">{certNumber}</span></p>
          <p className="mt-1">IMZO Sifat Nazorati • {new Date().getFullYear()} • O'z DSt standartlariga muvofiq</p>
        </div>
      </div>
    </div>
  );
};
