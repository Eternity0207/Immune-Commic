import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CreditsModal from "./components/CreditsModal";
import Panel from "./components/Panel";
import QuestionBlock from "./components/QuestionBlock";
import Sidebar from "./components/Sidebar";
import TermLearnMoreModal from "./components/TermLearnMoreModal";
import useUiAudio from "./hooks/useUiAudio";
import { CHARACTERS, FINAL_QUIZ, MID_STORY_QUESTIONS, PANELS, PANEL_TERMS } from "./lib/storyData";

const QUESTION_BY_PANEL = MID_STORY_QUESTIONS.reduce((accumulator, question) => {
  accumulator[question.insertAfter] = question;
  return accumulator;
}, {});

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [activeTermKey, setActiveTermKey] = useState("");
  const [playingPanelNumber, setPlayingPanelNumber] = useState(null);
  const [quizOpenRequest, setQuizOpenRequest] = useState(0);
  const [showFinalQuiz, setShowFinalQuiz] = useState(false);
  const narrationTokenRef = useRef(0);
  const preferredVoiceRef = useRef(null);
  const ttsPrimedRef = useRef(false);
  const fallbackNarrationRef = useRef(null);
  const { playSfx } = useUiAudio();

  const panels = useMemo(
    () => PANELS.map((panel) => ({ ...panel, terms: PANEL_TERMS[panel.number] ?? [] })),
    []
  );
  const finalPanelNumber = panels[panels.length - 1]?.number;

  const stopFallbackNarration = useCallback(() => {
    if (!fallbackNarrationRef.current) {
      return;
    }

    fallbackNarrationRef.current.pause();
    fallbackNarrationRef.current.src = "";
    fallbackNarrationRef.current = null;
  }, []);

  const stopNarration = useCallback(() => {
    narrationTokenRef.current += 1;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    stopFallbackNarration();
    setPlayingPanelNumber(null);
  }, [stopFallbackNarration]);

  const playFallbackNarration = useCallback(
    async (caption, panelNumber, narrationToken) => {
      if (!caption || typeof window === "undefined") {
        return;
      }

      stopFallbackNarration();

      const apiBase = (import.meta.env.VITE_TTS_API_BASE_URL || "").replace(/\/$/, "");
      const url = `${apiBase}/api/tts?lang=en&text=${encodeURIComponent(caption)}`;
      const audio = new Audio(url);
      audio.volume = 1;
      audio.preload = "none";

      const clearPlayingState = () => {
        if (narrationTokenRef.current !== narrationToken) {
          return;
        }

        setPlayingPanelNumber((value) => (value === panelNumber ? null : value));
      };

      audio.onplay = () => {
        if (narrationTokenRef.current !== narrationToken) {
          audio.pause();
          return;
        }

        setPlayingPanelNumber(panelNumber);
      };
      audio.onpause = clearPlayingState;
      audio.onended = clearPlayingState;
      audio.onerror = clearPlayingState;

      fallbackNarrationRef.current = audio;

      try {
        await audio.play();
      } catch {
        clearPlayingState();
      }
    },
    [stopFallbackNarration]
  );

  const pickPreferredVoice = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      return;
    }

    preferredVoiceRef.current =
      voices.find((voice) => /en-|en_|english|india|indian|hindi/i.test(`${voice.lang} ${voice.name}`)) || voices[0];
  }, []);

  const speakPanelCaption = useCallback(
    (panel, { cueVolume = 1 } = {}) => {
      if (!panel || typeof window === "undefined") {
        return;
      }

      const narrationToken = narrationTokenRef.current + 1;
      narrationTokenRef.current = narrationToken;

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      stopFallbackNarration();
      setPlayingPanelNumber(null);

      playSfx("whoosh", { volume: cueVolume, playbackRate: 0.9 });

      if (!("speechSynthesis" in window)) {
        playFallbackNarration(panel.caption, panel.number, narrationToken);
        return;
      }

      const synth = window.speechSynthesis;
      pickPreferredVoice();

      let hasStarted = false;
      let hasFallenBack = false;

      const runFallback = () => {
        if (hasStarted || hasFallenBack || narrationTokenRef.current !== narrationToken) {
          return;
        }

        hasFallenBack = true;
        synth.cancel();
        playFallbackNarration(panel.caption, panel.number, narrationToken);
      };

      const utterance = new SpeechSynthesisUtterance(panel.caption);
      utterance.rate = 0.86;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (preferredVoiceRef.current) {
        utterance.voice = preferredVoiceRef.current;
      }

      utterance.onstart = () => {
        if (narrationTokenRef.current !== narrationToken) {
          synth.cancel();
          return;
        }

        hasStarted = true;
        setPlayingPanelNumber(panel.number);
      };

      utterance.onend = () => {
        if (narrationTokenRef.current !== narrationToken) {
          return;
        }

        setPlayingPanelNumber((value) => (value === panel.number ? null : value));
      };

      utterance.onerror = () => {
        runFallback();
      };

      synth.cancel();
      synth.resume();
      synth.speak(utterance);

      window.setTimeout(() => {
        if (!hasStarted && narrationTokenRef.current === narrationToken) {
          runFallback();
        }
      }, 900);
    },
    [pickPreferredVoice, playFallbackNarration, playSfx, stopFallbackNarration]
  );

  const playTap = useCallback(() => {
    playSfx("tap", { volume: 0.35 });
  }, [playSfx]);

  const handlePlayNarration = useCallback(
    (panel) => {
      speakPanelCaption(panel, { cueVolume: 1 });
    },
    [speakPanelCaption]
  );

  const handlePauseNarration = useCallback(() => {
    playSfx("tap", { volume: 0.25 });
    stopNarration();
  }, [playSfx, stopNarration]);

  const handleQuestionAnswer = useCallback(
    (isCorrect) => {
      playSfx(isCorrect ? "win" : "error", { volume: 0.42 });
    },
    [playSfx]
  );

  const handleQuizAnswer = useCallback(
    (isCorrect) => {
      playSfx(isCorrect ? "win" : "error", { volume: 0.4 });
    },
    [playSfx]
  );

  const handleOpenTerm = useCallback(
    (termKey) => {
      playSfx("attack", { volume: 0.32, playbackRate: 1.08 });
      setActiveTermKey(termKey);
    },
    [playSfx]
  );

  useEffect(() => {
    const checkIfNearEnd = () => {
      const triggerPoint = document.documentElement.scrollHeight - 850;
      const currentPoint = window.scrollY + window.innerHeight;

      if (currentPoint >= triggerPoint) {
        setShowFinalQuiz(true);
      }
    };

    checkIfNearEnd();
    window.addEventListener("scroll", checkIfNearEnd, { passive: true });

    return () => window.removeEventListener("scroll", checkIfNearEnd);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    pickPreferredVoice();

    const handleVoicesChanged = () => {
      pickPreferredVoice();
    };

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
  }, [pickPreferredVoice]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    const primeTts = () => {
      if (ttsPrimedRef.current) {
        return;
      }

      ttsPrimedRef.current = true;

      try {
        const synth = window.speechSynthesis;
        const primer = new SpeechSynthesisUtterance(" ");
        primer.volume = 0;
        synth.speak(primer);
        synth.cancel();
      } catch {
        // Ignore primer failures and continue with normal narration attempts.
      }
    };

    window.addEventListener("pointerdown", primeTts, { once: true });
    return () => window.removeEventListener("pointerdown", primeTts);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        setIsCreditsOpen(false);
        setActiveTermKey("");
        stopNarration();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [stopNarration]);

  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, [stopNarration]);

  return (
    <div className="comic-app">
      <button
        type="button"
        className="sidebar-toggle-btn"
        onClick={() => {
          playTap();
          setIsSidebarOpen(true);
        }}
        aria-label="Open character and quiz sidebar"
      >
        <span />
        <span />
        <span />
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        characters={CHARACTERS}
        showFinalQuiz={showFinalQuiz}
        quizQuestions={FINAL_QUIZ}
        quizOpenRequest={quizOpenRequest}
        onUiClick={playTap}
        onQuizAnswer={handleQuizAnswer}
      />

      <button
        type="button"
        className="credits-toggle-btn"
        onClick={() => {
          playTap();
          setIsCreditsOpen(true);
        }}
      >
        Credits / About
      </button>

      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} onUiClick={playTap} />

      <TermLearnMoreModal termKey={activeTermKey} onClose={() => setActiveTermKey("")} onUiClick={playTap} />

      <header className="comic-header">
        <p className="comic-kicker">Immune Comic Reader</p>
        <h1>The Immune System Storyline</h1>
        <p>
          Scroll frame by frame. Pause at each checkpoint question and keep the sidebar open whenever you want
          character context.
        </p>
      </header>

      <main className="comic-feed">
        {panels.map((panel) => (
          <section key={panel.number} className="comic-segment">
            {panel.number === 1 ? <p className="section-flow-label">Character Introduction Panels</p> : null}
            {panel.number === 9 ? <p className="section-flow-label">Story Panels Begin</p> : null}

            <Panel
              panel={panel}
              onTermClick={handleOpenTerm}
              isNarrationPlaying={playingPanelNumber === panel.number}
              onNarrationPlay={handlePlayNarration}
              onNarrationPause={handlePauseNarration}
            />
            {QUESTION_BY_PANEL[panel.number] ? (
              <QuestionBlock question={QUESTION_BY_PANEL[panel.number]} onAnswerSelect={handleQuestionAnswer} />
            ) : null}

            {panel.number === finalPanelNumber ? (
              <div className="final-quiz-entry">
                <p className="final-quiz-entry-text">You reached the final panel. Ready to test your full understanding?</p>
                <button
                  type="button"
                  className="final-quiz-entry-btn"
                  onClick={() => {
                    playSfx("whoosh", { volume: 0.4 });
                    setShowFinalQuiz(true);
                    setIsSidebarOpen(true);
                    setQuizOpenRequest((value) => value + 1);
                  }}
                >
                  Take Final Quiz
                </button>
              </div>
            ) : null}
          </section>
        ))}
      </main>
    </div>
  );
}
