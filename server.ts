import express from "express";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/bitrix-webhook", async (req, res) => {
  try {
    console.log("📥 Webhook keldi:", req.body);
    res.json({ success: true, received: true });
  } catch (err) {
    console.error("❌ Xatolik:", err);
    res.status(500).json({ error: "Xatolik" });
  }
});

export default app;
