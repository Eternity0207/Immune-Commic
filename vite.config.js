import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fetchTtsAudioBuffer, getTtsParamsFromRequestUrl } from "./server/ttsService.js";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function ttsDevApiPlugin() {
  return {
    name: "tts-dev-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url || !request.url.startsWith("/api/tts")) {
          next();
          return;
        }

        if (request.method !== "GET") {
          sendJson(response, 405, { error: "Method not allowed" });
          return;
        }

        const { text, lang } = getTtsParamsFromRequestUrl(request.url);
        if (!text) {
          sendJson(response, 400, { error: "Missing required query parameter: text" });
          return;
        }

        try {
          const audioBuffer = await fetchTtsAudioBuffer({ text, lang });
          response.statusCode = 200;
          response.setHeader("Content-Type", "audio/mpeg");
          response.setHeader("Cache-Control", "public, max-age=86400");
          response.end(audioBuffer);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown TTS error";
          sendJson(response, 502, { error: message });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), ttsDevApiPlugin()],
});
