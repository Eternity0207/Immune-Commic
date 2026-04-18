import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function ComicScene({ level, panelIndex, onNext, onTransition }) {
  const [canAdvance, setCanAdvance] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const panel = useMemo(() => level.comicPanels[panelIndex], [level.comicPanels, panelIndex]);

  useEffect(() => {
    setCanAdvance(false);
    const timer = window.setTimeout(() => setCanAdvance(true), 1200);
    return () => window.clearTimeout(timer);
  }, [panelIndex]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "ArrowRight") return;
      if (!canAdvance) return;
      setHintUsed(true);
      onTransition();
      onNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canAdvance, onNext, onTransition]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
      onClick={() => {
        if (!canAdvance) return;
        setHintUsed(true);
        onTransition();
        onNext();
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black"
      />

      <div className="absolute left-0 top-0 z-30 h-14 w-full bg-black" />
      <div className="absolute bottom-0 left-0 z-30 h-14 w-full bg-black" />

      <AnimatePresence mode="wait">
        <motion.div
          key={panel.image}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-20 flex h-full w-full items-center justify-center"
        >
          <img src={panel.image} alt={panel.text} className="max-h-[82vh] w-auto max-w-[94vw] rounded-2xl object-contain shadow-[0_20px_80px_rgba(0,0,0,0.7)]" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-20 left-1/2 z-30 w-[min(92vw,760px)] -translate-x-1/2 rounded-2xl border border-white/20 bg-black/55 px-4 py-3 text-center backdrop-blur-sm">
        <p className="text-sm font-bold text-slate-100 sm:text-base">{panel.text}</p>
      </div>

      {!hintUsed ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: canAdvance ? 1 : 0.35 }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200"
        >
          {canAdvance ? "Press -> or click to continue" : "Cutscene playing..."}
        </motion.div>
      ) : null}
    </motion.section>
  );
}
