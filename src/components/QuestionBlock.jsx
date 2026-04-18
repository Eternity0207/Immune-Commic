import { useMemo, useState } from "react";
import useRevealOnView from "../hooks/useRevealOnView";
import { shuffleOptions } from "../lib/shuffleOptions";

export default function QuestionBlock({ question, onAnswerSelect }) {
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [wrapperRef, isVisible] = useRevealOnView({ threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  const shuffledOptions = useMemo(() => shuffleOptions(question.options), [question.id, question.options]);

  const selectedOption = useMemo(
    () => question.options.find((option) => option.id === selectedOptionId),
    [question.options, selectedOptionId]
  );

  const hasAnswered = selectedOptionId !== "";
  const isCorrect = selectedOptionId === question.correctOptionId;

  return (
    <aside ref={wrapperRef} className={`question-block ${isVisible ? "is-visible" : ""}`} aria-label="Story checkpoint question">
      <p className="question-kicker">Story Checkpoint</p>
      <h3 className="question-prompt">{question.prompt}</h3>

      <div className="question-options" role="group" aria-label="Select one answer">
        {shuffledOptions.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const optionClassName = [
            "question-option",
            isSelected && hasAnswered ? (isCorrect ? "is-correct" : "is-wrong") : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={option.id}
              type="button"
              className={optionClassName}
              onClick={() => {
                if (hasAnswered) {
                  return;
                }

                const answeredCorrectly = option.id === question.correctOptionId;
                setSelectedOptionId(option.id);
                onAnswerSelect?.({ questionId: question.id, isCorrect: answeredCorrectly });
              }}
              aria-pressed={isSelected}
              disabled={hasAnswered}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {hasAnswered ? (
        <p className={`question-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
          {isCorrect ? "Correct. +10 points. " : "Not quite. +0 points. "}
          {selectedOption?.explanation}
        </p>
      ) : (
        <p className="question-hint">Pick one option to get instant feedback.</p>
      )}
    </aside>
  );
}
