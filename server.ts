// server.js (ES module)
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

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

export default app;

// Lokal ishga tushirish
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}
