// server.ts - BOSHIDA
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { callBitrixMethod, getBitrixWebhookUrl, getShowroomPhone } from './src/services/bitrixService.js';
import { getStoredTickets, saveStoredTickets, mapServiceStatusToTicketStatus } from './src/services/storage.js';
import { ServiceStatus } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_BITRIX_WEBHOOK = process.env.VITE_BITRIX_WEBHOOK_URL || '';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Static fayllar
app.use(express.static(path.join(__dirname, 'dist')));

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    webhook: process.env.VITE_BITRIX_WEBHOOK_URL || "Sozlanmagan",
    env: process.env.NODE_ENV || 'development'
  });
});

// server.ts - To'liq webhook handler
app.post("/api/bitrix-webhook", async (req, res) => {
  try {
    console.log('📥 Bitrix24 webhook keldi');
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));

    const { event, data } = req.body;
    
    if (!event) {
      console.warn('⚠️ Event maydoni yo\'q');
      return res.status(400).json({ error: 'Event maydoni kerak' });
    }

    // 🔥 OnCrmDealUpdate - deal status o'zgarganda
    if (event === 'OnCrmDealUpdate' && data?.FIELDS?.ID) {
      const dealId = data.FIELDS.ID;
      const stageId = data.FIELDS.STAGE_ID;
      
      console.log(`🔄 Deal ${dealId} statusi o'zgardi: ${stageId}`);
      
      try {
        // 🔥 Deal ma'lumotlarini olish
        const deal = await callBitrixMethod('crm.deal.get', { id: dealId });
        
        if (!deal) {
          console.warn('⚠️ Deal topilmadi');
          return res.json({ success: false, error: 'Deal not found' });
        }

        // 🔥 Ticket ID ni olish (UF_CRM_SERVICE_TICKET_ID)
        const ticketId = deal.UF_CRM_SERVICE_TICKET_ID;
        console.log(`🔍 Ticket ID: ${ticketId}`);
        
        if (ticketId) {
          const tickets = getStoredTickets();
          const index = tickets.findIndex(t => t.id === ticketId);
          
          if (index !== -1) {
            console.log(`✅ Ticket ${ticketId} topildi`);
            
            // 🔥 C1 pipeline statuslarini map qilish
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
            console.log(`📊 Yangi serviceStatus: ${newServiceStatus}`);
            
            // 🔥 Ticket statusini yangilash
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
            console.log(`✅ Ticket ${ticketId} statusi yangilandi: ${newServiceStatus} -> ${tickets[index].status}`);
          } else {
            console.warn(`⚠️ Ticket ${ticketId} topilmadi`);
          }
        } else {
          console.warn(`⚠️ Deal ${dealId} da UF_CRM_SERVICE_TICKET_ID maydoni yo'q`);
        }
      } catch (dealErr: any) {
        console.error('❌ Deal ma\'lumotlarini olishda xatolik:', dealErr.message);
        return res.status(500).json({ 
          error: 'Deal ma\'lumotlarini olishda xatolik', 
          details: dealErr.message 
        });
      }
    } else {
      console.log(`ℹ️ Event: ${event}, boshqa ishlov kerak emas`);
    }
    
    res.json({ success: true });
  } catch (err: any) {
    console.error('❌ Webhook xatolik:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ 
      error: 'Webhook ishlov berishda xatolik',
      details: err.message 
    });
  }
});

// 🔥 SPA uchun - barcha yo'nalishlar index.html ga
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Vercel serverless uchun eksport qilish
export default app;

// Lokal ishga tushirish uchun
if (process.env.NODE_ENV !== "production") {
  const startDevServer = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`Health: /api/health`);
      console.log(`Webhook: /api/bitrix-webhook`);
    });
  };
  
  startDevServer();
}
