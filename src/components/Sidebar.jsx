import { useEffect, useMemo, useRef, useState } from "react";
import CharacterSection from "./CharacterSection";
import { shuffleOptions } from "../lib/shuffleOptions";

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
  onQuizAnswer
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

  return (
    <>
      <aside className={`comic-sidebar ${isOpen ? "is-open" : ""}`} aria-label="Comic resources sidebar">
        <header className="comic-sidebar-header">
          <p className="comic-sidebar-kicker">Guidebook</p>
          <h2>Characters + Final Quiz</h2>
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
          <h3>Final Quiz</h3>
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
