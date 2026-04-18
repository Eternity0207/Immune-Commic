import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import googleTTS from "google-tts-api";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const allowedOrigins = new Set([FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    }
  })
);

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "tts-proxy" });
});

app.get("/api/tts", async (request, response) => {
  const text = String(request.query.text || "").trim();
  const lang = String(request.query.lang || "en").trim();

  if (!text) {
    response.status(400).json({ error: "Missing required query parameter: text" });
    return;
  }

  // Keep payload length conservative for upstream Google TTS compatibility.
  const limitedText = text.slice(0, 190);

  try {
    const audioUrl = googleTTS.getAudioUrl(limitedText, {
      lang,
      slow: false,
      host: "https://translate.google.com"
    });

    const upstream = await fetch(audioUrl, {
      headers: {
        Accept: "audio/mpeg,*/*",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });

    if (!upstream.ok) {
      response.status(502).json({ error: `Upstream TTS failed with status ${upstream.status}` });
      return;
    }

    const audioBuffer = Buffer.from(await upstream.arrayBuffer());

    response.setHeader("Content-Type", "audio/mpeg");
    response.setHeader("Cache-Control", "public, max-age=86400");
    response.send(audioBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown TTS error";
    response.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`TTS backend listening on port ${PORT}`);
});
