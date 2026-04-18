import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CharacterIntroPage from "./components/CharacterIntroPage";
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

const CREDITS = {
  projectTitle: "Immune System Comic",
  professors: ["Dr. Sunil Lohar"],
  teamMembers: ["Arsh Goyal", "Gyan Vardhan Chauhan"]
};

function getScorePercent(score, maxScore) {
  if (!maxScore) {
    return 0;
  }

  return Math.round((score / maxScore) * 100);
}

function getScoreMessage(score, maxScore) {
  const scorePercent = getScorePercent(score, maxScore);

  if (scorePercent >= 80) {
    return "Great understanding!";
  }

  if (scorePercent >= 50) {
    return "Good progress, keep exploring the story details.";
  }

  return "Try again to improve!";
}

function getScoreBadge(score, maxScore) {
  const scorePercent = getScorePercent(score, maxScore);

  if (scorePercent >= 85) {
    return "Immune Expert";
  }

  if (scorePercent >= 60) {
    return "Quick Learner";
  }

  return "";
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [activeTermKey, setActiveTermKey] = useState("");
  const [playingPanelNumber, setPlayingPanelNumber] = useState(null);
  const [quizOpenRequest, setQuizOpenRequest] = useState(0);
  const [showFinalQuiz, setShowFinalQuiz] = useState(false);
  const [hasEnteredStory, setHasEnteredStory] = useState(false);
  const [checkpointScores, setCheckpointScores] = useState({});
  const [comicSessionKey, setComicSessionKey] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const narrationTokenRef = useRef(0);
  const preferredVoiceRef = useRef(null);
  const ttsPrimedRef = useRef(false);
  const fallbackNarrationRef = useRef(null);
  const { playSfx } = useUiAudio();

  const panels = useMemo(() => {
    const storyPanels = PANELS.filter((panel) => panel.number >= 9);
    const panelSource = storyPanels.length ? storyPanels : PANELS;

    return panelSource.map((panel) => ({
      ...panel,
      terms: PANEL_TERMS[panel.number] ?? []
    }));
  }, []);

  const finalPanelNumber = panels[panels.length - 1]?.number;
  const maximumCheckpointScore = MID_STORY_QUESTIONS.length * 10;
  const checkpointScore = useMemo(
    () => Object.values(checkpointScores).reduce((sum, value) => sum + value, 0),
    [checkpointScores]
  );
  const scoreMessage = getScoreMessage(checkpointScore, maximumCheckpointScore);
  const scoreBadge = getScoreBadge(checkpointScore, maximumCheckpointScore);

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

  const handleContinueToStory = useCallback(() => {
    playSfx("whoosh", { volume: 0.45, playbackRate: 0.95 });
    setIsCreditsOpen(false);
    setHasEnteredStory(true);

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 20);
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
    ({ questionId, isCorrect }) => {
      if (!questionId) {
        return;
      }

      setCheckpointScores((previous) => {
        if (Object.prototype.hasOwnProperty.call(previous, questionId)) {
          return previous;
        }

        return {
          ...previous,
          [questionId]: isCorrect ? 10 : 0
        };
      });

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

  const handleOpenFinalQuiz = useCallback(() => {
    playSfx("whoosh", { volume: 0.42 });
    setShowFinalQuiz(true);
    setIsSidebarOpen(true);
    setQuizOpenRequest((value) => value + 1);
  }, [playSfx]);

  const handleRestartComic = useCallback(() => {
    playSfx("tap", { volume: 0.32 });
    stopNarration();
    setCheckpointScores({});
    setShowFinalQuiz(false);
    setQuizOpenRequest(0);
    setIsSidebarOpen(false);
    setIsCreditsOpen(false);
    setActiveTermKey("");
    setScrollProgress(0);
    setShowScrollHint(true);
    setComicSessionKey((value) => value + 1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [playSfx, stopNarration]);

  useEffect(() => {
    if (!hasEnteredStory) {
      return;
    }

    const updateScrollMeta = () => {
      const page = document.documentElement;
      const maxScrollable = Math.max(page.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(100, Math.max(0, (window.scrollY / maxScrollable) * 100));

      setScrollProgress(progress);

      if (progress > 11) {
        setShowScrollHint(false);
      }

      if (window.scrollY + window.innerHeight >= page.scrollHeight - 780) {
        setShowFinalQuiz(true);
      }
    };

    updateScrollMeta();
    window.addEventListener("scroll", updateScrollMeta, { passive: true });
    window.addEventListener("resize", updateScrollMeta);

    return () => {
      window.removeEventListener("scroll", updateScrollMeta);
      window.removeEventListener("resize", updateScrollMeta);
    };
  }, [comicSessionKey, hasEnteredStory]);

  useEffect(() => {
    if (!hasEnteredStory || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    pickPreferredVoice();

    const handleVoicesChanged = () => {
      pickPreferredVoice();
    };

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
  }, [hasEnteredStory, pickPreferredVoice]);

  useEffect(() => {
    if (!hasEnteredStory || typeof window === "undefined" || !("speechSynthesis" in window)) {
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
  }, [hasEnteredStory]);

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

  if (!hasEnteredStory) {
    return (
      <div className="comic-app">
        <button
          type="button"
          className="floating-credits-btn"
          onClick={() => {
            playTap();
            setIsCreditsOpen(true);
          }}
        >
          Credits
        </button>

        <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} onUiClick={playTap} />

        <CharacterIntroPage characters={CHARACTERS} onContinue={handleContinueToStory} />
      </div>
    );
  }

  return (
    <div className="comic-app">
      <button
        type="button"
        className="floating-credits-btn"
        onClick={() => {
          playTap();
          setIsCreditsOpen(true);
        }}
      >
        Credits
      </button>

      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} onUiClick={playTap} />

      <div className="comic-progress-track" aria-hidden="true">
        <div className="comic-progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>

      <p className="score-chip" aria-live="polite">
        Score: {checkpointScore}
      </p>

      {scoreBadge ? <p className="score-badge">{scoreBadge}</p> : null}

      {showScrollHint ? <p className="comic-scroll-hint">Scroll to explore the comic</p> : null}

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
        credits={CREDITS}
        resetSignal={comicSessionKey}
        onOpenCredits={() => setIsCreditsOpen(true)}
      />

      <TermLearnMoreModal termKey={activeTermKey} onClose={() => setActiveTermKey("")} onUiClick={playTap} />

      <header className="comic-header-banner">
        <h1>Immune System Comic</h1>
      </header>

      <section className="comic-info-box" aria-label="Comic reading tips">
        <h2>How to Explore</h2>
        <ul>
          <li>Scroll frame-by-frame through the comic panels.</li>
          <li>Pause at each checkpoint question and answer carefully.</li>
          <li>Open the sidebar anytime for quiz and character references.</li>
          <li>Explore character context to strengthen your understanding.</li>
        </ul>
      </section>

      <main key={`story-${comicSessionKey}`} className="comic-feed">
        {panels.map((panel) => (
          <section key={panel.number} className="comic-segment">
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
              <div className="comic-end-summary">
                <p className="comic-end-kicker">Comic Complete</p>
                <h3>
                  Total Score: {checkpointScore}/{maximumCheckpointScore}
                </h3>
                <p className="comic-end-message">{scoreMessage}</p>
                {scoreBadge ? <p className="comic-end-badge">Badge Earned: {scoreBadge}</p> : null}

                <div className="comic-end-actions">
                  <button type="button" className="comic-end-btn" onClick={handleOpenFinalQuiz}>
                    Take Final Quiz
                  </button>
                  <button type="button" className="comic-end-btn is-secondary" onClick={handleRestartComic}>
                    Restart Comic
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ))}
      </main>
    </div>
  );
}
