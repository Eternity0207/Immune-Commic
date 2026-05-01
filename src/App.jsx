import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CharacterIntroPage from "./components/CharacterIntroPage";
import CreditsModal from "./components/CreditsModal";
import Panel from "./components/Panel";
import QuestionBlock from "./components/QuestionBlock";
import Sidebar from "./components/Sidebar";
import TermLearnMoreModal from "./components/TermLearnMoreModal";
import useUiAudio from "./hooks/useUiAudio";
import {
  CHARACTERS,
  FINAL_QUIZ,
  MID_STORY_QUESTIONS,
  PANELS,
  PANEL_TERMS,
} from "./lib/storyData";

const CHAPTERS = {
  chapter1: {
    key: "chapter1",
    path: "/chapter-1",
    title: "Chapter 1: The First Alarm",
    startPanel: 9,
    endPanel: 29,
  },
  chapter2: {
    key: "chapter2",
    path: "/chapter-2",
    title: "Chapter 2: The Adaptive Arm Awakens",
    startPanel: 30,
    endPanel: 49,
  },
  chapter3: {
    key: "chapter3",
    path: "/chapter-3",
    title: "Chapter 3: Memory and Vaccines",
    startPanel: 50,
    endPanel: 59,
  },
};

const VALID_PATHS = [
  "/",
  CHAPTERS.chapter1.path,
  CHAPTERS.chapter2.path,
  CHAPTERS.chapter3.path,
];

const REVIEW_LINKS = [
  { label: "Neutrophil", href: "https://en.wikipedia.org/wiki/Neutrophil" },
  {
    label: "T-Helper Cel",
    href: "https://en.wikipedia.org/wiki/T_helper_cell",
  },
  {
    label: "Memory Cell",
    href: "https://en.wikipedia.org/wiki/Immunological_memory",
  },
];

const CREDITS = {
  projectTitle: "Immune System Comic",
  institution:
    "Developed at IIT Jodhpur (Indian Institute of Technology Jodhpur)",
  professors: ["Dr. Sunil Lohar"],
  teamMembers: ["Arsh Goyal", "Gyan Vardhan Chauhan"],
};

function normalizePath(pathname) {
  return VALID_PATHS.includes(pathname) ? pathname : "/";
}

function mapQuestionsByPanel(questions) {
  return questions.reduce((accumulator, question) => {
    accumulator[question.insertAfter] = question;
    return accumulator;
  }, {});
}

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
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window === "undefined"
      ? "/"
      : normalizePath(window.location.pathname),
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [activeTermKey, setActiveTermKey] = useState("");

  const [quizOpenRequest, setQuizOpenRequest] = useState(0);
  const [hasEnteredStory, setHasEnteredStory] = useState(false);
  const [chapterScores, setChapterScores] = useState({
    chapter1: {},
    chapter2: {},
    chapter3: {},
  });
  const [chapterResetKeys, setChapterResetKeys] = useState({
    chapter1: 0,
    chapter2: 0,
    chapter3: 0,
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);


  const backgroundMusicRef = useRef(null);
  const { playSfx } = useUiAudio();

  const ensureAmbientPlayback = useCallback(() => {
    const track = backgroundMusicRef.current;

    if (!track || !track.paused) {
      return;
    }

    const playPromise = track.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Playback may still be blocked until browser allows it.
      });
    }
  }, []);

  const chapter1Panels = useMemo(
    () =>
      PANELS.filter(
        (panel) =>
          panel.number >= CHAPTERS.chapter1.startPanel &&
          panel.number <= CHAPTERS.chapter1.endPanel,
      ).map((panel) => ({
        ...panel,
        terms: PANEL_TERMS[panel.number] ?? [],
      })),
    [],
  );

  const chapter2Panels = useMemo(
    () =>
      PANELS.filter(
        (panel) =>
          panel.number >= CHAPTERS.chapter2.startPanel &&
          panel.number <= CHAPTERS.chapter2.endPanel,
      ).map((panel) => ({
        ...panel,
        terms: PANEL_TERMS[panel.number] ?? [],
      })),
    [],
  );

  const chapter3Panels = useMemo(
    () =>
      PANELS.filter(
        (panel) =>
          panel.number >= CHAPTERS.chapter3.startPanel &&
          panel.number <= CHAPTERS.chapter3.endPanel,
      ).map((panel) => ({
        ...panel,
        terms: PANEL_TERMS[panel.number] ?? [],
      })),
    [],
  );

  const chapter1Questions = useMemo(
    () =>
      MID_STORY_QUESTIONS.filter(
        (question) =>
          question.insertAfter >= CHAPTERS.chapter1.startPanel &&
          question.insertAfter <= CHAPTERS.chapter1.endPanel,
      ),
    [],
  );

  const chapter2Questions = useMemo(
    () =>
      MID_STORY_QUESTIONS.filter(
        (question) =>
          question.insertAfter >= CHAPTERS.chapter2.startPanel &&
          question.insertAfter <= CHAPTERS.chapter2.endPanel,
      ),
    [],
  );

  const chapter3Questions = useMemo(
    () =>
      MID_STORY_QUESTIONS.filter(
        (question) =>
          question.insertAfter >= CHAPTERS.chapter3.startPanel &&
          question.insertAfter <= CHAPTERS.chapter3.endPanel,
      ),
    [],
  );

  const chapter1QuestionByPanel = useMemo(
    () => mapQuestionsByPanel(chapter1Questions),
    [chapter1Questions],
  );
  const chapter2QuestionByPanel = useMemo(
    () => mapQuestionsByPanel(chapter2Questions),
    [chapter2Questions],
  );
  const chapter3QuestionByPanel = useMemo(
    () => mapQuestionsByPanel(chapter3Questions),
    [chapter3Questions],
  );

  const totalQuestionsChapter1 = chapter1Questions.length;
  const totalQuestionsChapter2 = chapter2Questions.length;
  const totalQuestionsChapter3 = chapter3Questions.length;
  const chapter1TotalMarks = totalQuestionsChapter1 * 10;
  const chapter2TotalMarks = totalQuestionsChapter2 * 10;
  const chapter3TotalMarks = totalQuestionsChapter3 * 10;

  const chapter1Score = useMemo(
    () =>
      Object.values(chapterScores.chapter1).reduce(
        (sum, value) => sum + value,
        0,
      ),
    [chapterScores.chapter1],
  );
  const chapter2Score = useMemo(
    () =>
      Object.values(chapterScores.chapter2).reduce(
        (sum, value) => sum + value,
        0,
      ),
    [chapterScores.chapter2],
  );
  const chapter3Score = useMemo(
    () =>
      Object.values(chapterScores.chapter3).reduce(
        (sum, value) => sum + value,
        0,
      ),
    [chapterScores.chapter3],
  );

  const chapter1Percent = getScorePercent(chapter1Score, chapter1TotalMarks);
  const chapter2Percent = getScorePercent(chapter2Score, chapter2TotalMarks);
  const chapter3Percent = getScorePercent(chapter3Score, chapter3TotalMarks);
  const chapter1Passed = chapter1Percent >= 50;
  const chapter2Passed = chapter2Percent >= 50;
  const chapter3Passed = chapter3Percent >= 50;
  const isFinalQuizUnlocked = chapter1Passed && chapter2Passed && chapter3Passed;

  const activeChapter = useMemo(() => {
    if (currentPath === CHAPTERS.chapter1.path) {
      return CHAPTERS.chapter1;
    }

    if (currentPath === CHAPTERS.chapter2.path) {
      return CHAPTERS.chapter2;
    }

    if (currentPath === CHAPTERS.chapter3.path) {
      return CHAPTERS.chapter3;
    }

    return null;
  }, [currentPath]);

  const activeChapterKey = activeChapter?.key;

  const activePanels = useMemo(() => {
    if (activeChapterKey === "chapter1") {
      return chapter1Panels;
    }

    if (activeChapterKey === "chapter2") {
      return chapter2Panels;
    }

    if (activeChapterKey === "chapter3") {
      return chapter3Panels;
    }

    return [];
  }, [activeChapterKey, chapter1Panels, chapter2Panels, chapter3Panels]);

  const activeQuestionByPanel =
    activeChapterKey === "chapter1"
      ? chapter1QuestionByPanel
      : activeChapterKey === "chapter2"
        ? chapter2QuestionByPanel
        : chapter3QuestionByPanel;
  const activeFinalPanelNumber = activePanels[activePanels.length - 1]?.number;
  const activeChapterResetKey = activeChapterKey
    ? chapterResetKeys[activeChapterKey]
    : 0;

  const activeChapterScore =
    activeChapterKey === "chapter1"
      ? chapter1Score
      : activeChapterKey === "chapter2"
        ? chapter2Score
        : chapter3Score;
  const activeChapterTotalMarks =
    activeChapterKey === "chapter1"
      ? chapter1TotalMarks
      : activeChapterKey === "chapter2"
        ? chapter2TotalMarks
        : chapter3TotalMarks;
  const activeChapterScoreMessage = getScoreMessage(
    activeChapterScore,
    activeChapterTotalMarks,
  );
  const activeChapterScoreBadge = getScoreBadge(
    activeChapterScore,
    activeChapterTotalMarks,
  );

  const sidebarResetSignal =
    chapterResetKeys.chapter1 +
    chapterResetKeys.chapter2 +
    chapterResetKeys.chapter3;

  const navigateTo = useCallback((nextPath, { replace = false } = {}) => {
    const normalizedPath = normalizePath(nextPath);
    const browserPath = "/";

    if (typeof window !== "undefined") {
      if (replace) {
        window.history.replaceState({}, "", browserPath);
      } else if (window.location.pathname !== browserPath) {
        window.history.pushState({}, "", browserPath);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setCurrentPath(normalizedPath);
    setScrollProgress(0);
    setShowScrollHint(true);
  }, []);



  const playTap = useCallback(() => {
    playSfx("tap", { volume: 0.35 });
    ensureAmbientPlayback();
  }, [ensureAmbientPlayback, playSfx]);

  const handlePathChange = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.pathname !== "/") {
      window.history.replaceState({}, "", "/");
    }

    setCurrentPath("/");
    setScrollProgress(0);
    setShowScrollHint(true);
  }, []);

  const handleContinueToChapter2 = useCallback(() => {
    if (!chapter1Passed) {
      return;
    }

    playSfx("whoosh", { volume: 0.42 });
    navigateTo(CHAPTERS.chapter2.path);
  }, [chapter1Passed, navigateTo, playSfx]);

  const handleContinueToChapter3 = useCallback(() => {
    if (!chapter2Passed) {
      return;
    }

    playSfx("whoosh", { volume: 0.42 });
    navigateTo(CHAPTERS.chapter3.path);
  }, [chapter2Passed, navigateTo, playSfx]);

  const handleContinueToStory = useCallback(() => {
    playSfx("whoosh", { volume: 0.45, playbackRate: 0.95 });
    setIsCreditsOpen(false);
    setHasEnteredStory(true);
    navigateTo(CHAPTERS.chapter1.path);
  }, [navigateTo, playSfx]);



  const handleQuestionAnswer = useCallback(
    ({ questionId, isCorrect, chapterKey }) => {
      if (!questionId || !chapterKey) {
        return;
      }

      setChapterScores((previous) => {
        const currentChapterScores = previous[chapterKey] ?? {};

        if (
          Object.prototype.hasOwnProperty.call(currentChapterScores, questionId)
        ) {
          return previous;
        }

        return {
          ...previous,
          [chapterKey]: {
            ...currentChapterScores,
            [questionId]: isCorrect ? 10 : 0,
          },
        };
      });

      playSfx(isCorrect ? "win" : "error", { volume: 0.42 });
    },
    [playSfx],
  );

  const handleQuizAnswer = useCallback(
    (isCorrect) => {
      playSfx(isCorrect ? "win" : "error", { volume: 0.4 });
    },
    [playSfx],
  );

  const handleOpenTerm = useCallback(
    (termKey) => {
      playSfx("attack", { volume: 0.32, playbackRate: 1.08 });
      setActiveTermKey(termKey);
    },
    [playSfx],
  );

  const handleOpenFinalQuiz = useCallback(() => {
    if (!isFinalQuizUnlocked) {
      return;
    }

    playSfx("whoosh", { volume: 0.42 });
    setIsSidebarOpen(true);
    setQuizOpenRequest((value) => value + 1);
  }, [isFinalQuizUnlocked, playSfx]);

  const handleRetryChapter = useCallback(
    (chapterKey) => {
      playSfx("tap", { volume: 0.32 });

      setChapterScores((previous) => {
        const next = {
          ...previous,
          [chapterKey]: {},
        };

        if (chapterKey === "chapter1") {
          next.chapter2 = {};
          next.chapter3 = {};
        }

        if (chapterKey === "chapter2") {
          next.chapter3 = {};
        }

        return next;
      });

      setChapterResetKeys((previous) => {
        const next = {
          ...previous,
          [chapterKey]: previous[chapterKey] + 1,
        };

        if (chapterKey === "chapter1") {
          next.chapter2 = previous.chapter2 + 1;
          next.chapter3 = previous.chapter3 + 1;
        }

        if (chapterKey === "chapter2") {
          next.chapter3 = previous.chapter3 + 1;
        }

        return next;
      });

      setQuizOpenRequest(0);
      setIsSidebarOpen(false);
      setIsCreditsOpen(false);
      setActiveTermKey("");
      navigateTo(
        chapterKey === "chapter1"
          ? CHAPTERS.chapter1.path
          : chapterKey === "chapter2"
            ? CHAPTERS.chapter2.path
            : CHAPTERS.chapter3.path,
      );
    },
    [navigateTo, playSfx],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (window.location.pathname !== "/") {
      window.history.replaceState({}, "", "/");
      setCurrentPath("/");
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const ambientSources = ["/sounds/piano.mp3", "/sounds/ambient.wav"];
    let sourceIndex = 0;

    const ambientTrack = new Audio(ambientSources[sourceIndex]);
    ambientTrack.loop = true;
    ambientTrack.volume = 0.5;
    ambientTrack.preload = "auto";
    ambientTrack.playsInline = true;
    backgroundMusicRef.current = ambientTrack;

    const tryPlayAmbient = () => {
      const activeTrack = backgroundMusicRef.current;

      if (!activeTrack) {
        return;
      }

      const playPromise = activeTrack.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Browsers may block autoplay until first user interaction.
        });
      }
    };

    const unlockAmbient = () => {
      tryPlayAmbient();
    };

    const advanceAmbientSource = () => {
      sourceIndex += 1;

      if (sourceIndex >= ambientSources.length) {
        return;
      }

      ambientTrack.src = ambientSources[sourceIndex];
      ambientTrack.load();
      tryPlayAmbient();
    };

    ambientTrack.addEventListener("canplaythrough", tryPlayAmbient);
    ambientTrack.addEventListener("error", advanceAmbientSource);
    ambientTrack.load();
    tryPlayAmbient();

    window.addEventListener("pointerdown", unlockAmbient, { passive: true });
    window.addEventListener("click", unlockAmbient, { passive: true });
    window.addEventListener("touchstart", unlockAmbient, { passive: true });
    window.addEventListener("keydown", unlockAmbient);
    window.addEventListener("focus", unlockAmbient);
    document.addEventListener("visibilitychange", unlockAmbient);

    return () => {
      window.removeEventListener("pointerdown", unlockAmbient);
      window.removeEventListener("click", unlockAmbient);
      window.removeEventListener("touchstart", unlockAmbient);
      window.removeEventListener("keydown", unlockAmbient);
      window.removeEventListener("focus", unlockAmbient);
      document.removeEventListener("visibilitychange", unlockAmbient);
      ambientTrack.removeEventListener("canplaythrough", tryPlayAmbient);
      ambientTrack.removeEventListener("error", advanceAmbientSource);

      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.src = "";
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    window.addEventListener("popstate", handlePathChange);
    return () => window.removeEventListener("popstate", handlePathChange);
  }, [handlePathChange]);

  useEffect(() => {
    if (!hasEnteredStory && currentPath !== "/") {
      navigateTo("/", { replace: true });
      return;
    }

    if (currentPath === CHAPTERS.chapter2.path && !chapter1Passed) {
      navigateTo(CHAPTERS.chapter1.path, { replace: true });
    }

    if (currentPath === CHAPTERS.chapter3.path && !chapter2Passed) {
      navigateTo(CHAPTERS.chapter2.path, { replace: true });
    }
  }, [chapter1Passed, currentPath, hasEnteredStory, navigateTo]);

  useEffect(() => {
    if (!hasEnteredStory || !activeChapterKey) {
      return;
    }

    const updateScrollMeta = () => {
      const page = document.documentElement;
      const maxScrollable = Math.max(page.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(
        100,
        Math.max(0, (window.scrollY / maxScrollable) * 100),
      );

      setScrollProgress(progress);

      if (progress > 11) {
        setShowScrollHint(false);
      }
    };

    updateScrollMeta();
    window.addEventListener("scroll", updateScrollMeta, { passive: true });
    window.addEventListener("resize", updateScrollMeta);

    return () => {
      window.removeEventListener("scroll", updateScrollMeta);
      window.removeEventListener("resize", updateScrollMeta);
    };
  }, [activeChapterKey, activeChapterResetKey, hasEnteredStory]);



  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        setIsCreditsOpen(false);
        setActiveTermKey("");
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const renderReviewLinks = () => (
    <div className="chapter-review-links" aria-label="Review concepts">
      <p>Review Concepts</p>
      <div className="chapter-review-link-list">
        {REVIEW_LINKS.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );

  const renderChapterEndSummary = () => {
    if (!activeChapterKey) {
      return null;
    }

    if (activeChapterKey === "chapter1") {
      return (
        <div className="comic-end-summary">
          <p className="comic-end-kicker">Chapter 1 Complete</p>
          <h3>
            Score: {chapter1Score}/{chapter1TotalMarks} ({chapter1Percent}%)
          </h3>
          {chapter1Passed ? (
            <p className="comic-end-message">{activeChapterScoreMessage}</p>
          ) : (
            <p className="chapter-gate-warning">
              You need at least 50% to proceed
            </p>
          )}

          <div className="comic-end-actions">
            {chapter1Passed ? (
              <button
                type="button"
                className="comic-end-btn"
                onClick={handleContinueToChapter2}
              >
                Continue to Chapter 2
              </button>
            ) : (
              <button
                type="button"
                className="comic-end-btn is-secondary"
                onClick={() => handleRetryChapter("chapter1")}
              >
                Retry Chapter 1
              </button>
            )}
          </div>

          {!chapter1Passed ? renderReviewLinks() : null}
        </div>
      );
    }

    if (activeChapterKey === "chapter2") {
      return (
        <div className="comic-end-summary">
          <p className="comic-end-kicker">Chapter 2 Complete</p>
          <h3>
            Score: {chapter2Score}/{chapter2TotalMarks} ({chapter2Percent}%)
          </h3>

          {chapter2Passed ? (
            <p className="comic-end-message">{activeChapterScoreMessage}</p>
          ) : (
            <p className="chapter-gate-warning">
              You need at least 50% to proceed
            </p>
          )}

          <div className="comic-end-actions">
            {chapter2Passed ? (
              <button
                type="button"
                className="comic-end-btn"
                onClick={handleContinueToChapter3}
              >
                Continue to Chapter 3
              </button>
            ) : (
              <button
                type="button"
                className="comic-end-btn is-secondary"
                onClick={() => handleRetryChapter("chapter2")}
              >
                Retry Chapter 2
              </button>
            )}
          </div>

          {!chapter2Passed ? renderReviewLinks() : null}
        </div>
      );
    }

    const canTakeFinalQuiz = chapter3Passed && isFinalQuizUnlocked;

    return (
      <div className="comic-end-summary">
        <p className="comic-end-kicker">Chapter 3 Complete</p>
        <h3>
          Score: {chapter3Score}/{chapter3TotalMarks} ({chapter3Percent}%)
        </h3>

        {chapter3Passed ? (
          <p className="comic-end-message">{activeChapterScoreMessage}</p>
        ) : (
          <p className="chapter-gate-warning">
            You need at least 50% to proceed
          </p>
        )}

        <div className="comic-end-actions">
          <button
            type="button"
            className="comic-end-btn"
            onClick={handleOpenFinalQuiz}
            disabled={!canTakeFinalQuiz}
          >
            Take Final Quiz
          </button>

          {!chapter3Passed ? (
            <button
              type="button"
              className="comic-end-btn is-secondary"
              onClick={() => handleRetryChapter("chapter3")}
            >
              Retry Chapter 3
            </button>
          ) : null}
        </div>

        {!canTakeFinalQuiz ? (
          <p className="chapter-quiz-lock-note">
            Complete all three chapters with at least 50% to unlock quiz
          </p>
        ) : null}

        {!chapter3Passed ? renderReviewLinks() : null}
      </div>
    );
  };

  if (!hasEnteredStory || currentPath === "/") {
    return (
      <div className="comic-app comic-app-intro">
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

        <CreditsModal
          isOpen={isCreditsOpen}
          onClose={() => setIsCreditsOpen(false)}
          onUiClick={playTap}
        />

        <CharacterIntroPage
          characters={CHARACTERS}
          onContinue={handleContinueToStory}
        />
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

      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        onUiClick={playTap}
      />

      <div className="comic-progress-track" aria-hidden="true">
        <div
          className="comic-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <p className="score-chip" aria-live="polite">
        Score: {activeChapterScore}
      </p>

      {activeChapterScoreBadge ? (
        <p className="score-badge">{activeChapterScoreBadge}</p>
      ) : null}

      {showScrollHint ? (
        <p className="comic-scroll-hint">Scroll to explore this chapter</p>
      ) : null}

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
        showFinalQuiz={isFinalQuizUnlocked}
        quizQuestions={FINAL_QUIZ}
        quizOpenRequest={quizOpenRequest}
        onUiClick={playTap}
        onQuizAnswer={handleQuizAnswer}
        credits={CREDITS}
        resetSignal={sidebarResetSignal}
        onOpenCredits={() => setIsCreditsOpen(true)}
      />

      <TermLearnMoreModal
        termKey={activeTermKey}
        onClose={() => setActiveTermKey("")}
        onUiClick={playTap}
      />

      <header className="comic-header-banner">
        <h1>Immune System Comic</h1>
      </header>

      <section className="chapter-title-banner" aria-label="Current chapter">
        <p className="chapter-title-kicker">
          {activeChapter?.key === "chapter1"
            ? "Chapter 1"
            : activeChapter?.key === "chapter2"
              ? "Chapter 2"
              : "Chapter 3"}
        </p>
        <h2>{activeChapter?.title}</h2>
      </section>

      <section className="comic-info-box" aria-label="Comic reading tips">
        <h2>How to Explore</h2>
        <ul>
          <li>Scroll frame-by-frame through the comic panels.</li>
          <li>Each checkpoint question is worth 10 points.</li>
          <li>
            You need at least 50% in each chapter to unlock the next stage.
          </li>
          <li>Open the sidebar anytime for quiz and character references.</li>
        </ul>
      </section>

      <main
        key={`story-${activeChapterKey}-${activeChapterResetKey}`}
        className="comic-feed"
      >
        {activePanels.map((panel) => (
          <section key={panel.number} className="comic-segment">
            <Panel
              panel={panel}
              onTermClick={handleOpenTerm}
            />

            {activeQuestionByPanel[panel.number] ? (
              <QuestionBlock
                question={activeQuestionByPanel[panel.number]}
                onAnswerSelect={(payload) =>
                  handleQuestionAnswer({
                    ...payload,
                    chapterKey: activeChapterKey,
                  })
                }
              />
            ) : null}

            {panel.number === activeFinalPanelNumber
              ? renderChapterEndSummary()
              : null}
          </section>
        ))}
      </main>
    </div>
  );
}
