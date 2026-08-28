import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Award, 
  QrCode, 
  Calendar, 
  FileText, 
  Building2, 
  UserCheck, 
  Sparkles,
  Loader2,
  Phone
} from 'lucide-react';
import { Order } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ImzoLogo } from './ImzoLogo';

interface WarrantyModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const WarrantyModal: React.FC<WarrantyModalProps> = ({ order, isOpen, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    try {
      setIsGeneratingPdf(true);
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`Kafolat_Taloni_${order.invoiceNumber}.pdf`);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isReady = ['okk_otdi', 'topshirildi'].includes(order.status);
  const warrantyMonths = (order.warranty?.warrantyPeriodMonths && order.warranty.warrantyPeriodMonths >= 60) 
    ? order.warranty.warrantyPeriodMonths 
    : 60;
  const inspectorName = (order.warranty?.okkManagerName && order.warranty.okkManagerName !== '-') 
    ? order.warranty.okkManagerName 
    : (order.okkInspectorName || "OKK Muhandisi");
  const certNumber = order.warranty?.certificateNumber || `KT-2026-${order.invoiceNumber.replace(/\D/g, '').slice(-4) || '0000'}`;

  return (
    <AnimatePresence>
      <div 
        id="warranty-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/90 shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-base md:text-lg font-bold text-white flex items-center gap-1.5 truncate">
                  <span>Kafolat Taloni</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium shrink-0">
                    {isReady ? 'Sifat Nazoratidan O\'tgan' : 'Jarayonda'}
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  Schet: <span className="text-slate-200 font-mono font-semibold">{order.invoiceNumber}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="btn-print-certificate"
                onClick={handlePrint}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
                title="Chop etish"
              >
                <Printer className="w-4 h-4" />
                <span>Chop etish</span>
              </button>

              <button
                id="btn-download-pdf"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Tayyorlanmoqda...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Yuklandi!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="sm:hidden">Yuklash</span>
                    <span className="hidden sm:inline">PDF Yuklab Olish</span>
                  </>
                )}
              </button>

              <button
                id="btn-close-warranty"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Printable Canvas / Container */}
          <div className="p-2 sm:p-5 md:p-8 overflow-y-auto flex-1 bg-slate-950/70">
            <div
              ref={certificateRef}
              id="printable-warranty-certificate"
              className="relative w-full bg-gradient-to-b from-[#FFFDF9] to-[#FAF5E8] text-slate-900 p-4 sm:p-7 md:p-10 rounded-xl sm:rounded-2xl border-2 sm:border-4 md:border-[6px] border-double border-[#D4AF37] shadow-2xl selection:bg-amber-100 max-w-full"
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            >
              {/* Corner Luxury Flourishes */}
              <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-[#D4AF37]" />
              <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-[#D4AF37]" />

              {/* Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Award className="w-64 h-64 sm:w-96 sm:h-96 text-[#855B14]" />
              </div>

              {/* Top Header */}
              <div className="text-center relative z-10 pb-4 sm:pb-6 border-b border-amber-900/20">
                <div className="flex justify-center pb-2">
                  <ImzoLogo size="lg" variant="dark" className="h-10 sm:h-12" />
                </div>
                <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#B8860B]" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#855B14]">
                    Rasmiy Sifat va Kafolat Taloni
                  </span>
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#B8860B]" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 uppercase font-serif">
                  KAFOLAT TALONI
                </h1>
                <p className="text-[11px] sm:text-xs font-serif italic text-amber-950/70 mt-0.5">
                  Sertifikat raqami: <strong className="text-amber-900 font-mono font-bold">{certNumber}</strong>
                </p>
              </div>

              {/* Info Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-6 border-b border-amber-900/15 relative z-10 text-xs sm:text-sm">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Buyurtmachi (Mijoz):</span>
                    <span className="font-bold text-slate-900 text-right">{order.clientFullName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Schet raqami:</span>
                    <span className="font-mono font-bold text-slate-900 bg-amber-100/70 px-2 py-0.5 rounded text-xs">
                      {order.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Showroom filiali:</span>
                    <span className="font-semibold text-slate-800 text-right">{order.showroomName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Mas'ul menedjer:</span>
                    <span className="font-semibold text-slate-800">{order.salesManagerName}</span>
                  </div>
                </div>

                <div className="space-y-2 sm:border-l sm:border-amber-900/15 sm:pl-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Buyurtma sanasi:</span>
                    <span className="font-semibold text-slate-800 font-mono text-xs">{order.orderDate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Fabrikaga berilgan:</span>
                    <span className="font-semibold text-slate-800 font-mono text-xs">{order.factorySentDate || order.orderDate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Ishlab chiqarish:</span>
                    <span className="font-semibold text-slate-800 font-mono text-xs">{order.productionStartDate || order.orderDate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Tayyor bo'lgan sana:</span>
                    <span className="font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded text-xs font-mono">
                      {order.readyDate || (isReady ? 'Tasdiqlangan' : order.orderDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Specifications Table */}
              <div className="py-4 relative z-10">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#855B14] mb-2 sm:mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8860B]" />
                  Kafolat berilgan mahsulotlar spetsifikatsiyasi:
                </h4>

                <div className="overflow-x-auto rounded-lg border border-amber-900/20 bg-white/80 shadow-xs">
                  <table className="w-full text-left text-xs min-w-[340px]">
                    <thead className="bg-amber-100/60 text-slate-700 font-semibold border-b border-amber-900/15">
                      <tr>
                        <th className="py-2 px-2.5 sm:px-3 text-[11px]">№</th>
                        <th className="py-2 px-2.5 sm:px-3 text-[11px]">Mahsulot va Model</th>
                        <th className="py-2 px-2.5 sm:px-3 text-[11px]">Rangi</th>
                        <th className="py-2 px-2.5 sm:px-3 text-[11px]">Hajm</th>
                        <th className="py-2 px-2.5 sm:px-3 text-right text-[11px]">Soni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/10 text-slate-800">
                      {order.products.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-2 px-2.5 sm:px-3 font-mono text-slate-500 text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-2.5 sm:px-3">
                            <span className="font-bold block text-slate-900 text-xs">{item.name}</span>
                            <span className="text-[10px] text-slate-600 block">{item.model && item.model !== '-' ? item.model : (item.dimensions && item.dimensions !== '-' ? item.dimensions : '')}</span>
                          </td>
                          <td className="py-2 px-2.5 sm:px-3 font-medium text-[11px]">{item.color && item.color !== '-' ? item.color : '-'}</td>
                          <td className="py-2 px-2.5 sm:px-3 font-medium text-[11px]">{item.areaSqM > 0 ? `${item.areaSqM} m²` : '-'}</td>
                          <td className="py-2 px-2.5 sm:px-3 text-right font-bold text-xs">{item.quantity} dona</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warranty Period Banner */}
              <div className="my-2 sm:my-3 p-3 sm:p-4 bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between relative z-10 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#B8860B] text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-sm shrink-0">
                    {warrantyMonths}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Kafolat Muddati: {warrantyMonths} Oy ({warrantyMonths / 12} Yil)
                    </h5>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                      Konstruksiyalar, furnitura va lak-bo'yoq qatlamiga rasmiy servis kafolatlangan.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sifat: {order.warranty?.qualityScore || 99.8}%
                  </span>
                </div>
              </div>

              {/* Bottom Verification, Signatures & Stamps (Responsive Stacking for Mobile & PC) */}
              <div className="pt-4 sm:pt-6 mt-3 sm:mt-4 border-t border-amber-900/20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center sm:items-end relative z-10 text-xs">
                {/* Left: Inspector Info */}
                <div className="text-center sm:text-left">
                  <p className="text-[11px] text-slate-500 font-medium">Sifat nazorati xulosasi:</p>
                  <p className="text-xs font-bold text-emerald-900 inline-flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Barcha standartlarga to'liq mos keladi
                  </p>
                  <div className="mt-2 sm:mt-3">
                    <p className="text-[10px] text-slate-500">Sifat Nazorati Mas'ul Muhandisi:</p>
                    <p className="font-bold text-slate-900 text-xs">{inspectorName}</p>
                    <p className="text-[10px] text-slate-500">{order.warranty?.okkManagerTitle || 'Bosh sifat nazoratchisi'}</p>
                  </div>
                </div>

                {/* Middle: Official Stamp and Signature */}
                <div className="flex flex-col items-center justify-center relative py-1">
                  {/* Signature */}
                  <div className="relative w-32 h-12 flex items-center justify-center">
                    <svg className="w-28 h-10 text-blue-900 -rotate-3" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 40 C30 10, 45 55, 60 20 C70 -5, 80 50, 95 30 C105 15, 120 40, 150 25 M30 35 L140 33" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="absolute bottom-0 text-[8px] text-slate-400 font-mono uppercase">
                      Imzo: {inspectorName.split(' ')[0]}
                    </span>
                  </div>

                  {/* Round Seal Stamp */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-blue-800/80 p-1 flex items-center justify-center text-center rotate-6 shadow-inner bg-blue-50/30">
                    <div className="w-full h-full rounded-full border border-blue-900/60 flex flex-col items-center justify-center p-1 text-[7px] sm:text-[8px] font-bold text-blue-900 uppercase leading-tight">
                      <span>* IMZO SIFAT NAZORATI *</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-800 my-0.5" />
                      <span className="text-[6px] sm:text-[7px] text-emerald-900 font-extrabold">TASDIQLANDI</span>
                      <span>{order.readyDate || order.orderDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right: QR Code Online Verification */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                  <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 bg-slate-950 p-1 flex items-center justify-center rounded">
                      <div className="grid grid-cols-4 gap-0.5 w-full h-full bg-white p-0.5">
                        <div className="bg-slate-950 rounded-xs" />
                        <div className="bg-slate-950 rounded-xs" />
                        <div className="border border-slate-950" />
                        <div className="bg-slate-950 rounded-xs" />
                        <div className="border border-slate-950" />
                        <div className="bg-slate-950 rounded-xs" />
                        <div className="bg-slate-950 rounded-xs" />
                        <div className="border border-slate-950" />
                        <div className="bg-slate-950 rounded-xs" />
                        <div className="border border-slate-950" />
                        <div className="bg-slate-950 rounded-xs" />
                        <div className="bg-slate-950 rounded-xs" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-mono">
                    Onlayn QR Verifikatsiya
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono">
                    {certNumber}
                  </p>
                </div>
              </div>

              {/* Small Footnote */}
              <div className="mt-4 pt-3 border-t border-amber-900/10 text-[9px] sm:text-[10px] text-slate-500 text-center flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <span>Call Markaz: +998 (71) 200-88-00</span>
                <span className="hidden sm:inline">•</span>
                <span>portal.fabrika.uz</span>
                <span className="hidden sm:inline">•</span>
                <span>O'z DSt standartlariga muvofiq</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
