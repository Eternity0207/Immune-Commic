import { fetchTtsAudioBuffer, normalizeTtsParams } from "../server/ttsService.js";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getQueryValue(request, key) {
  if (request.query && Object.prototype.hasOwnProperty.call(request.query, key)) {
    return request.query[key];
  }

  const url = new URL(request.url || "", "http://localhost");
  return url.searchParams.get(key);
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const { text, lang } = normalizeTtsParams({
    text: getQueryValue(request, "text"),
    lang: getQueryValue(request, "lang")
  });

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
}
