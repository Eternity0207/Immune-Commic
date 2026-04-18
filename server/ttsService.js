import googleTTS from "google-tts-api";

const MAX_TTS_TEXT_LENGTH = 190;
const DEFAULT_TTS_LANG = "en";

function normalizeQueryValue(value) {
  if (Array.isArray(value)) {
    return String(value[0] ?? "").trim();
  }

  return String(value ?? "").trim();
}

export function normalizeTtsParams({ text, lang }) {
  const normalizedText = normalizeQueryValue(text).slice(0, MAX_TTS_TEXT_LENGTH);
  const normalizedLang = normalizeQueryValue(lang) || DEFAULT_TTS_LANG;

  return {
    text: normalizedText,
    lang: normalizedLang
  };
}

export function getTtsParamsFromRequestUrl(requestUrl = "") {
  const url = new URL(requestUrl, "http://localhost");
  return normalizeTtsParams({
    text: url.searchParams.get("text"),
    lang: url.searchParams.get("lang")
  });
}

export async function fetchTtsAudioBuffer({ text, lang }) {
  const { text: normalizedText, lang: normalizedLang } = normalizeTtsParams({ text, lang });

  if (!normalizedText) {
    throw new Error("Missing required query parameter: text");
  }

  const audioUrl = googleTTS.getAudioUrl(normalizedText, {
    lang: normalizedLang,
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
    throw new Error(`Upstream TTS failed with status ${upstream.status}`);
  }

  return Buffer.from(await upstream.arrayBuffer());
}
