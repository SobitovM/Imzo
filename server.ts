import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Static fayllar
app.use(express.static(path.join(__dirname, 'dist')));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    webhook: process.env.VITE_BITRIX_WEBHOOK_URL || 'Sozlanmagan'
  });
});

// Webhook
app.post('/api/bitrix-webhook', (req, res) => {
  console.log('📥 Webhook keldi:', req.body);
  res.json({ success: true, received: true });
});

// 🔥 SPA uchun - barcha yo'nalishlar index.html ga
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

export default app;

// Lokal ishga tushirish
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}
