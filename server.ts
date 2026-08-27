import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const DEFAULT_WEBHOOK = "https://bitrix.imzo.uz/rest/244/lhfi8leh3yqxl3sc/";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", webhook: "https://bitrix.imzo.uz" });
  });

  // Server-side Bitrix24 Proxy to avoid CORS and ensure high-speed querying
  app.post("/api/bitrix-proxy", async (req, res) => {
    try {
      const { webhookUrl, method, params } = req.body;
      const targetWebhook = (webhookUrl || DEFAULT_WEBHOOK).trim().replace(/\/+$/, '') + '/';
      const bitrixUrl = `${targetWebhook}${method}.json`;

      // 6 second timeout to prevent server hang when Bitrix server is behind corporate firewall
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
            ? `Bitrix24 serveriga (${targetWebhook}) ulanishda vaqt tugadi (Timeout 6s). 'bitrix.imzo.uz' serveri korporativ ichki tarmoqda (VPN / IP Whitelist) yoki Tas-IX da joylashgan bo'lishi mumkin.`
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Bitrix proxy active)`);
  });
}

startServer();
