import { useCallback, useEffect, useRef } from "react";

const SOUND_MAP = {
  tap: "/sounds/tap.wav",
  pop: "/sounds/pop.wav",
  whoosh: "/sounds/whoosh.wav",
  win: "/sounds/win.wav",
  error: "/sounds/error.wav",
  attack: "/sounds/attack.wav"
};

export default function useUiAudio() {
  const baseAudioRef = useRef({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const baseAudio = {};

    Object.entries(SOUND_MAP).forEach(([name, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      baseAudio[name] = audio;
    });

    baseAudioRef.current = baseAudio;

    return () => {
      Object.values(baseAudioRef.current).forEach((audio) => {
        audio.pause();
      });
      baseAudioRef.current = {};
    };
  }, []);

  const playSfx = useCallback((name, options = {}) => {
    if (typeof window === "undefined") {
      return;
    }

    const baseAudio = baseAudioRef.current[name];
    if (!baseAudio) {
      return;
    }

    const instance = baseAudio.cloneNode();
    instance.volume = options.volume ?? 0.42;
    instance.playbackRate = options.playbackRate ?? 1;

    instance.play().catch(() => {
      // Ignore autoplay blocking until first user gesture.
    });
  }, []);

  return { playSfx };
}
