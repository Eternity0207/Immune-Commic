import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

const SHAPES = {
  SELF: "hex",
  NONSELF: "triangle",
  TRICKY: "octagon",
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function buildShapeSet(level) {
  const count = level.tricky ? 10 : 8;
  const items = [];

  for (let i = 0; i < count; i += 1) {
    const makeSelf = i % 2 === 0;

    items.push({
      id: `${level.id}-${i}`,
      isSelf: makeSelf,
      shape: makeSelf ? SHAPES.SELF : SHAPES.NONSELF,
      x: randomBetween(10, 84),
      y: randomBetween(18, 74),
      active: true,
    });
  }

  if (level.tricky) {
    items.push({
      id: `${level.id}-tricky-a`,
      isSelf: true,
      shape: SHAPES.TRICKY,
      x: randomBetween(16, 80),
      y: randomBetween(25, 72),
      active: true,
      tricky: true,
    });
    items.push({
      id: `${level.id}-tricky-b`,
      isSelf: true,
      shape: SHAPES.TRICKY,
      x: randomBetween(16, 80),
      y: randomBetween(25, 72),
      active: true,
      tricky: true,
    });
  }

  return items;
}

function shapeClass(shape) {
  if (shape === SHAPES.TRIANGLE) return "shape-triangle";
  if (shape === SHAPES.OCTAGON) return "shape-octagon";
  return "shape-hex";
}

export default function GameScene({
  level,
  phase,
  outcome,
  feedbackText,
  character,
  actionPulse,
  onStartInteraction,
  onActionPulse,
  onResolve,
  onViewComic,
}) {
  const [shapes, setShapes] = useState([]);
  const [hits, setHits] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [timer, setTimer] = useState(level.timerSec || 0);
  const [dialogue, setDialogue] = useState({ text: level.intro, x: 50, y: 82 });

  const resolvedRef = useRef(false);

  const targetIsSelf = useMemo(() => level.targetType === "self", [level.targetType]);

  const showTimer = phase === "interaction" && Boolean(level.timerSec);

  useEffect(() => {
    if (phase !== "interaction") return;
    resolvedRef.current = false;
    setShapes(buildShapeSet(level));
    setHits(0);
    setWrongFlash(false);
    setShake(false);
    setHintUsed(false);
    setDialogue({ text: "Click to identify pattern", x: 50, y: 82 });
    setTimer(level.timerSec || 0);
  }, [phase, level]);

  useEffect(() => {
    if (!showTimer) return undefined;
    if (resolvedRef.current) return undefined;

    const timerId = window.setInterval(() => {
      setTimer((value) => {
        if (value <= 1) {
          window.clearInterval(timerId);
          if (!resolvedRef.current) {
            resolvedRef.current = true;
            onResolve(false);
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [showTimer, onResolve]);

  const setActionDialogue = (text, x, y) => {
    setDialogue({ text, x, y });
  };

  const resolveIfComplete = (nextHits, successMeta = {}) => {
    if (resolvedRef.current) return;

    const completed = nextHits >= level.requiredHits;
    if (!completed) return;

    resolvedRef.current = true;

    const meta = {
      ...successMeta,
      fastBonus: Boolean(level.timerSec && timer >= 5),
    };

    onResolve(true, meta);
  };

  const handleWrongPick = (x, y, autoimmunity = false) => {
    onActionPulse("wrong");
    setWrongFlash(true);
    setShake(true);
    setActionDialogue(autoimmunity ? "Mistake: attacked self" : "Wrong pattern", x, y);

    window.setTimeout(() => setWrongFlash(false), 220);
    window.setTimeout(() => setShake(false), 240);

    if (level.failOnFirstMistake && !resolvedRef.current) {
      resolvedRef.current = true;
      onResolve(false, { autoimmunity: true });
    }
  };

  const handleShapeClick = (shape, event) => {
    if (phase !== "interaction") return;
    if (!shape.active) return;
    if (resolvedRef.current) return;

    if (!hintUsed) setHintUsed(true);

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((rect.left + rect.width * 0.5) / window.innerWidth) * 100;
    const y = ((rect.top - 10) / window.innerHeight) * 100;

    const isCorrect = targetIsSelf ? shape.isSelf : !shape.isSelf;

    if (!isCorrect) {
      handleWrongPick(x, y, shape.isSelf && !targetIsSelf);
      return;
    }

    const nextShapes = shapes.map((item) => (item.id === shape.id ? { ...item, active: false } : item));
    setShapes(nextShapes);

    const nextHits = hits + 1;
    setHits(nextHits);

    if (level.triggerAttackOnResolve) {
      onActionPulse("attack");
      setActionDialogue("Attack initiated", x, y);
    } else {
      onActionPulse("correct");
      setActionDialogue(targetIsSelf ? "Recognized as self" : "Threat detected", x, y);
    }

    resolveIfComplete(nextHits);
  };

  const hintText = targetIsSelf
    ? "Click shapes matching SELF pattern (hex)"
    : "Click NON-SELF pattern shapes (triangle)";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="relative h-full w-full overflow-hidden"
    >
      <GameCanvas mode="story" sceneType={level.sceneType} actionPulse={actionPulse} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(248,113,113,0.16),transparent_40%)]" />

      {wrongFlash ? <div className="absolute inset-0 z-10 bg-red-500/30" /> : null}

      <div className="absolute left-4 top-4 z-30 rounded-2xl border border-white/20 bg-black/45 px-4 py-3 backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-200">{level.title}</p>
        <p className="mt-1 text-sm font-bold text-slate-100">Objective: {level.objective}</p>
      </div>

      <div className="absolute right-4 top-4 z-30 rounded-2xl border border-white/20 bg-black/45 px-3 py-2 backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-cyan-200">Unit</p>
        <p className="text-sm font-extrabold text-white">{character.name}</p>
      </div>

      {showTimer ? (
        <div className="absolute right-4 top-20 z-30 rounded-xl border border-yellow-200/35 bg-yellow-400/10 px-3 py-2 text-xs font-black tracking-[0.08em] text-yellow-100 backdrop-blur-sm">
          Timer: {timer}s
        </div>
      ) : null}

      {phase === "intro" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-[min(92vw,640px)] rounded-3xl border border-white/20 bg-black/55 px-6 py-8 text-center backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Level Intro</p>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">{level.intro}</h2>
            <button
              type="button"
              onClick={onStartInteraction}
              className="mt-7 rounded-full border border-cyan-100/35 bg-cyan-300/18 px-6 py-2 text-xs font-black uppercase tracking-[0.12em]"
            >
              Start Interaction
            </button>
          </div>
        </div>
      ) : null}

      {phase === "interaction" ? (
        <div className="absolute inset-0 z-20 px-4 py-20">
          <motion.div
            animate={shake ? { x: [0, -12, 10, -8, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.28 }}
            className="relative h-full w-full"
          >
            {shapes.map((shape) => (
              <motion.button
                key={shape.id}
                type="button"
                onClick={(event) => handleShapeClick(shape, event)}
                whileHover={{ scale: shape.active ? 1.08 : 1 }}
                className={`absolute shape-token ${shapeClass(shape.shape)} ${shape.active ? "opacity-100" : "opacity-30"} ${
                  shape.isSelf ? "shape-self" : "shape-threat"
                }`}
                style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
              />
            ))}
          </motion.div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-100 backdrop-blur-sm">
            Hits: {hits} / {level.requiredHits}
          </div>
        </div>
      ) : null}

      {phase === "result" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-[min(92vw,620px)] rounded-3xl border px-6 py-8 text-center backdrop-blur-sm ${
              outcome === "success"
                ? "border-emerald-200/45 bg-emerald-300/15 shadow-[0_0_34px_rgba(16,185,129,0.45)]"
                : "border-red-200/45 bg-red-300/14 shadow-[0_0_34px_rgba(239,68,68,0.35)]"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/90">Level Result</p>
            <h3 className="mt-2 text-3xl font-extrabold text-white">{feedbackText}</h3>
            <button
              type="button"
              onClick={onViewComic}
              className="mt-6 rounded-full border border-white/40 bg-black/40 px-6 py-2 text-xs font-black uppercase tracking-[0.12em]"
            >
              View Comic Cutscene
            </button>
          </motion.div>
        </div>
      ) : null}

      {phase === "interaction" && !hintUsed ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-100 backdrop-blur-sm"
        >
          {hintText}
        </motion.div>
      ) : null}

      {phase === "interaction" ? (
        <motion.div
          key={`${dialogue.text}-${dialogue.x}-${dialogue.y}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-xl border border-cyan-100/30 bg-black/55 px-3 py-2 text-[11px] font-black tracking-[0.05em] text-cyan-100 backdrop-blur-sm"
          style={{ left: `${dialogue.x}%`, top: `${dialogue.y}%` }}
        >
          {dialogue.text}
        </motion.div>
      ) : null}
    </motion.section>
  );
}
