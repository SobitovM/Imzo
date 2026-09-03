import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { callBitrixMethod, getBitrixWebhookUrl } from './src/services/bitrixService';
import { getStoredTickets, saveStoredTickets, mapServiceStatusToTicketStatus } from './src/services/storage';
import { ServiceStatus } from './src/types';

export const DEFAULT_BITRIX_WEBHOOK = import.meta.env.VITE_BITRIX_WEBHOOK_URL || '';

// 🔥 Express app ni yaratamiz
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", webhook: "https://bitrix.imzo.uz" });
});

// Server-side Bitrix24 Proxy
app.post("/api/bitrix-proxy", async (req, res) => {
  try {
    const { webhookUrl, method, params } = req.body;
    const targetWebhook = (webhookUrl || DEFAULT_BITRIX_WEBHOOK).trim().replace(/\/+$/, '') + '/';
    const bitrixUrl = `${targetWebhook}${method}.json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const bitrixRes = await fetch(bitrixUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params || {}),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await bitrixRes.json();
      if (!bitrixRes.ok || data.error) {
        return res.status(bitrixRes.status >= 400 ? bitrixRes.status : 400).json({
          error: true,
          error_description: data.error_description || data.error || "Bitrix24 API Error",
        });
      }

      return res.json({
        success: true,
        result: data.result,
        total: data.total,
        next: data.next,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr.name === 'AbortError' || fetchErr.code === 'UND_ERR_CONNECT_TIMEOUT' || fetchErr.message?.includes('timeout') || fetchErr.cause?.name === 'ConnectTimeoutError';
      
      return res.status(502).json({
        error: true,
        isTimeout,
        error_description: isTimeout
          ? `Bitrix24 serveriga (${targetWebhook}) ulanishda vaqt tugadi (Timeout 6s).`
          : `Bitrix24 serveriga ulanib bo'lmadi: ${fetchErr.message || 'Tarmoq xatosi'}`,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      error_description: err.message || "Internal Proxy Error",
    });
  }
});

// 🔥 Bitrix24 Webhook - status o'zgarishini qabul qilish
app.post("/api/bitrix-webhook", async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('📥 Bitrix24 webhook keldi:', { event, data: data?.FIELDS });

    if (event === 'OnCrmDealUpdate' && data?.FIELDS?.ID) {
      const dealId = data.FIELDS.ID;
      const stageId = data.FIELDS.STAGE_ID;
      
      console.log(`🔄 Deal ${dealId} statusi o'zgardi: ${stageId}`);
      
      try {
        const webhookUrl = getBitrixWebhookUrl();
        if (!webhookUrl) {
          console.warn('Bitrix24 Webhook URL sozlanmagan');
          return res.json({ success: false, error: 'Webhook URL not configured' });
        }

        const deal = await callBitrixMethod('crm.deal.get', { id: dealId });
        
        console.log('✅ Deal ma\'lumotlari:', deal);
        
        if (deal && deal.UF_CRM_SERVICE_TICKET_ID) {
          const ticketId = deal.UF_CRM_SERVICE_TICKET_ID;
          
          const tickets = getStoredTickets();
          const index = tickets.findIndex(t => t.id === ticketId);
          
          if (index !== -1) {
            const serviceStatusMap: Record<string, ServiceStatus> = {
              'C1:NEW': 'yangi',
              'C1:UC_WV7G2R': 'master',
              'C1:PREPARATION': 'jarayonda',
              'C1:UC_PIL0QY': 'jarayonda',
              'C1:WON': 'hal_qilindi',
              'C1:LOSE': 'bekor_qilindi',
              'C1:UC_E0X40P': 'montaj_tugallanmagan',
            };
            
            const newServiceStatus = serviceStatusMap[stageId] || 'yangi';
            
            tickets[index].serviceStatus = newServiceStatus;
            tickets[index].status = mapServiceStatusToTicketStatus(newServiceStatus);
            
            if (newServiceStatus === 'hal_qilindi') {
              const now = new Date();
              const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              tickets[index].resolvedAt = timeStr;
              tickets[index].resolvedByManager = deal.UF_CRM_SERVICE_SPECIALIST || 'Servis xodimi';
              tickets[index].resolutionNotes = deal.COMMENTS || 'Muammo bartaraf etildi';
            }
            
            saveStoredTickets(tickets);
            console.log(`✅ Ticket ${ticketId} statusi yangilandi: ${newServiceStatus}`);
          } else {
            console.warn(`Ticket ${ticketId} topilmadi`);
          }
        } else {
          console.warn(`Deal ${dealId} da UF_CRM_SERVICE_TICKET_ID maydoni yo'q`);
        }
      } catch (dealErr) {
        console.error('Deal ma\'lumotlarini olishda xatolik:', dealErr);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Webhook xatolik:', err);
    res.status(500).json({ error: 'Webhook ishlov berishda xatolik' });
  }
});

// 🔥 Vercel serverless uchun eksport qilish
export default app;

// 🔥 Lokal ishga tushirish uchun (npm run dev)
if (process.env.NODE_ENV !== "production") {
  // Vite middleware for development
  const startDevServer = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT} (Bitrix proxy active)`);
      console.log(`Webhook endpoint: /api/bitrix-webhook`);
    });
  };
  
  startDevServer();
} else {
  // Production - Vercel serverless
  // Express app ni Vercel uchun eksport qilamiz
}
