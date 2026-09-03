// server.ts - SODDALASHTIRILGAN VERSION
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    webhook: process.env.VITE_BITRIX_WEBHOOK_URL || "Sozlanmagan"
  });
});

// Webhook
app.post("/api/bitrix-webhook", (req, res) => {
  console.log("Webhook keldi:", req.body);
  res.json({ success: true });
});

export default app;

// Lokal ishga tushirish
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
