import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  CheckCircle2, 
  Clock, 
  Star, 
  UserCheck, 
  MessageSquare, 
  Sparkles, 
  Send,
  AlertCircle,
  ThumbsUp,
  HelpCircle,
  ChevronRight,
  XCircle,
  UserCog,
  Wrench
} from 'lucide-react';
import { ServiceTicket } from '../types';
import { rateServiceTicket } from '../services/storage';
import confetti from 'canvas-confetti';

interface ServiceHistoryProps {
  tickets: ServiceTicket[];
  onRefresh: () => void;
}

// 🔥 Servis statuslarini o'zbek tilida ko'rsatish
const getServiceStatusInfo = (status: string): { label: string; color: string; icon: React.ReactNode } => {
  const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    'yangi': { 
      label: '🆕 Yangi ariza', 
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: <Clock className="w-3.5 h-3.5" />
    },
    'master': { 
      label: '👨‍🔧 Mutaxassisga yo\'naltirildi', 
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      icon: <UserCog className="w-3.5 h-3.5" />
    },
    'jarayonda': { 
      label: '⏳ Jarayonda', 
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: <Wrench className="w-3.5 h-3.5" />
    },
    'usta_biriktirildi': { 
      label: '👨‍🔧 Usta biriktirildi', 
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      icon: <UserCheck className="w-3.5 h-3.5" />
    },
    'hal_qilindi': { 
      label: '✅ Hal qilindi', 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    },
    'bekor_qilindi': { 
      label: '❌ Bekor qilindi', 
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      icon: <XCircle className="w-3.5 h-3.5" />
    },
    'montaj_tugallanmagan': { 
      label: '⚠️ Montaj tugallanmagan', 
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      icon: <AlertCircle className="w-3.5 h-3.5" />
    },
  };
  return statusMap[status] || { 
    label: status, 
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    icon: <HelpCircle className="w-3.5 h-3.5" />
  };
};

export const ServiceHistory: React.FC<ServiceHistoryProps> = ({ tickets, onRefresh }) => {
  const [ratingTicketId, setRatingTicketId] = useState<string | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  const handleOpenRating = (ticket: ServiceTicket) => {
    setRatingTicketId(ticket.id);
    setSelectedStars(ticket.clientRating || 5);
    setFeedbackText(ticket.clientFeedback || '');
  };

  const handleSubmitRating = (ticketId: string) => {
    setIsSubmittingRating(true);
    setTimeout(() => {
      rateServiceTicket(ticketId, selectedStars, feedbackText);
      setIsSubmittingRating(false);
      setRatingTicketId(null);
      onRefresh();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Safe fallback
      }
    }, 400);
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-xs font-medium">Hozircha servis bo'yicha murojaatlar mavjud emas</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Mahsulot bo'yicha savol yoki usta ko'rigi zarur bo'lsa, yuqoridagi "Servisga Murojaat" tugmasidan foydalanishingiz mumkin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Servis Murojaatlari Tarixi ({tickets.length})
        </h4>
        <span className="text-[11px] text-slate-400">
          Avtomatik arxivlanadi
        </span>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => {
          const isResolved = ticket.status === 'hal_qilindi';
          const isPendingRating = isResolved && !ticket.clientRating;
          const statusKey = ticket.serviceStatus || ticket.status;
          const statusInfo = getServiceStatusInfo(statusKey);

          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                isPendingRating 
                  ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              {isPendingRating && (
                <div className="mb-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs font-semibold text-emerald-300">
                      Sizning murojaatingiz hal qilindi! Iltimos, xizmat sifatini baholang.
                    </p>
                  </div>
                  <button
                    id={`btn-rate-${ticket.id}`}
                    onClick={() => handleOpenRating(ticket)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Baholash</span>
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    ID: {ticket.id}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {ticket.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {ticket.createdAt}
                  </span>
                  {ticket.showroomName && ticket.showroomName !== "Ko'rsatilmagan" && (
                    <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      {ticket.showroomName}
                    </span>
                  )}
                </div>
              </div>

              <div className="py-3 text-xs text-slate-300 leading-relaxed">
                <p className="text-slate-400 text-[11px] mb-1 font-medium">Murojaat mazmuni:</p>
                <p className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-slate-200">
                  {ticket.problemDetails}
                </p>
              </div>

              {isResolved && (
                <div className="mt-2 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Muammoni hal qilgan mas'ul: <strong>{ticket.resolvedByManager || ticket.assignedSpecialist}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Hal qilingan sana: {ticket.resolvedAt}
                    </span>
                  </div>

                  {ticket.resolutionNotes && (
                    <div className="text-slate-300 text-xs pt-1 border-t border-emerald-900/30">
                      <span className="text-slate-400 text-[11px]">Usta / Menejer xulosasi: </span>
                      {ticket.resolutionNotes}
                    </div>
                  )}
                </div>
              )}

              {ticket.clientRating ? (
                <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Siz bergan baho:</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (ticket.clientRating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-amber-400 font-bold ml-1">{ticket.clientRating}/5</span>
                  </div>

                  {ticket.clientFeedback && (
                    <span className="text-slate-300 italic text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      "{ticket.clientFeedback}"
                    </span>
                  )}
                </div>
              ) : null}

              <AnimatePresence>
                {ratingTicketId === ticket.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                        Xizmat ko'rsatish sifatini baholang:
                      </h5>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {selectedStars} / 5 yulduz
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-center py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedStars(star)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= selectedStars
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-slate-700 hover:text-slate-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Menejer va usta ishi haqida qisqa izoh..."
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRatingTicketId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingRating}
                        onClick={() => handleSubmitRating(ticket.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingRating ? 'Saqlanmoqda...' : 'Bahoni Yuborish'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
