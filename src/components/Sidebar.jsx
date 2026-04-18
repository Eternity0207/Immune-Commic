import { useEffect, useMemo, useRef, useState } from "react";
import CharacterSection from "./CharacterSection";
import { shuffleOptions } from "../lib/shuffleOptions";

const CREDIT_LINKS = {
  "Dr. Sunil Lohar": "https://iitj.ac.in/People/Profile/5ee5e2a2-ebcc-471c-9287-3987cdac57e2",
  "Arsh Goyal": "https://www.linkedin.com/in/arshgoyal0607/",
  "Gyan Vardhan Chauhan": "https://www.linkedin.com/in/gyan-vardhan-chauhan/"
};

function getQuizMessage(score, total) {
  if (total === 0) {
    return "";
  }

  if (score >= Math.ceil(total * 0.7)) {
    return "You understand the system well.";
  }

  return "Revisit key concepts.";
}

export default function Sidebar({
  isOpen,
  onClose,
  characters,
  showFinalQuiz,
  quizQuestions,
  quizOpenRequest,
  onUiClick,
  onQuizAnswer,
  credits,
  resetSignal,
  onOpenCredits
}) {
  const [answers, setAnswers] = useState({});
  const finalQuizSectionRef = useRef(null);

  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () => quizQuestions.reduce((total, question) => total + (answers[question.id] === question.correctOptionId ? 1 : 0), 0),
    [answers, quizQuestions]
  );
  const hasCompletedQuiz = quizQuestions.length > 0 && answeredCount === quizQuestions.length;
  const quizMessage = getQuizMessage(score, quizQuestions.length);
  const shuffledQuizOptionsByQuestion = useMemo(
    () =>
      Object.fromEntries(
        quizQuestions.map((question) => [question.id, shuffleOptions(question.options)])
      ),
    [quizQuestions]
  );

  useEffect(() => {
    if (!isOpen || !showFinalQuiz || !quizOpenRequest) {
      return;
    }

    finalQuizSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isOpen, showFinalQuiz, quizOpenRequest]);

  useEffect(() => {
    setAnswers({});
  }, [resetSignal]);

  return (
    <>
      <aside className={`comic-sidebar ${isOpen ? "is-open" : ""}`} aria-label="Comic resources sidebar">
        <header className="comic-sidebar-header">
          <p className="comic-sidebar-kicker">Guidebook</p>
          <h2>Characters, Quiz, Credits</h2>
          <button
            type="button"
            className="close-sidebar-btn"
            onClick={() => {
              onUiClick?.();
              onClose();
            }}
            aria-label="Close sidebar"
          >
            Close
          </button>
        </header>

        <CharacterSection characters={characters} />

        <section ref={finalQuizSectionRef} className={`sidebar-section final-quiz-section ${showFinalQuiz ? "is-visible" : "is-locked"}`}>
          <h3>Quiz</h3>
          {showFinalQuiz ? (
            <>
              <p className="sidebar-intro">Answer all questions based on the full story arc.</p>

              <div className="final-quiz-list">
                {quizQuestions.map((question, index) => {
                  const selectedOptionId = answers[question.id];
                  const hasAnswered = selectedOptionId !== undefined;
                  const displayOptions = shuffledQuizOptionsByQuestion[question.id] ?? question.options;

                  return (
                    <article key={question.id} className="final-quiz-item">
                      <p className="final-quiz-question">
                        {index + 1}. {question.prompt}
                      </p>

                      <div className="final-quiz-options" role="group" aria-label={`Answers for question ${index + 1}`}>
                        {displayOptions.map((option) => {
                          const isSelected = selectedOptionId === option.id;
                          const isCorrectOption = option.id === question.correctOptionId;

                          let className = "final-quiz-option";
                          if (hasAnswered && isCorrectOption) {
                            className += " is-correct";
                          } else if (hasAnswered && isSelected && !isCorrectOption) {
                            className += " is-wrong";
                          }

                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={className}
                              onClick={() => {
                                setAnswers((prev) => ({ ...prev, [question.id]: option.id }));
                                onQuizAnswer?.(isCorrectOption);
                              }}
                              aria-pressed={isSelected}
                            >
                              {option.text}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered ? <p className="final-quiz-feedback">{question.explanation}</p> : null}
                    </article>
                  );
                })}
              </div>

              <div className="quiz-score-box" aria-live="polite">
                <p>
                  Score: {score}/{quizQuestions.length}
                </p>
                {hasCompletedQuiz ? <p>{quizMessage}</p> : <p>Complete all questions to see your final message.</p>}
              </div>
            </>
          ) : (
            <p className="quiz-locked-message">Scroll near the end of the comic to unlock the final quiz.</p>
          )}
        </section>

        <section className="sidebar-section credits-section">
          <h3>Credits</h3>
          <article className="sidebar-credits-card">
            <p className="sidebar-credits-label">Project</p>
            <p className="sidebar-credits-value">{credits?.projectTitle}</p>

            <p className="sidebar-credits-label">Professors</p>
            {(credits?.professors ?? []).map((professor) => {
              const profileUrl = CREDIT_LINKS[professor];

              if (!profileUrl) {
                return (
                  <p key={professor} className="sidebar-credits-value">
                    {professor}
                  </p>
                );
              }

              return (
                <a
                  key={professor}
                  className="sidebar-credits-link"
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {professor}
                </a>
              );
            })}

            <p className="sidebar-credits-label">Team Members</p>
            {(credits?.teamMembers ?? []).map((member) => {
              const profileUrl = CREDIT_LINKS[member];

              if (!profileUrl) {
                return (
                  <p key={member} className="sidebar-credits-value">
                    {member}
                  </p>
                );
              }

              return (
                <a
                  key={member}
                  className="sidebar-credits-link"
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {member}
                </a>
              );
            })}

            <button
              type="button"
              className="sidebar-credits-open-btn"
              onClick={() => {
                onUiClick?.();
                onOpenCredits?.();
              }}
            >
              Open Credits
            </button>
          </article>
        </section>
      </aside>

      {isOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => {
            onUiClick?.();
            onClose();
          }}
          aria-label="Close sidebar backdrop"
        />
      ) : null}
    </>
  );
}
