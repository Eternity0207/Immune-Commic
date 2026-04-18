import { motion } from "framer-motion";

export default function Hero({ onStart }) {
  return (
    <motion.section
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#1f2f52_0%,#0a0f1a_46%,#05070d_100%)] px-6"
    >
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -right-20 bottom-24 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative text-center">
        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="text-xs font-extrabold uppercase tracking-[0.34em] text-slate-300"
        >
          Visual Immune Comic
        </motion.p>
        <motion.h1
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24, duration: 0.6 }}
          className="mx-auto mt-4 max-w-4xl font-['Baloo_2'] text-5xl font-extrabold leading-[0.92] text-ink sm:text-6xl md:text-7xl"
        >
          Inside Your Immune System
        </motion.h1>

        <motion.button
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="mt-10 rounded-full bg-white/95 px-8 py-3 text-sm font-extrabold text-slate-900 shadow-scene"
          type="button"
        >
          Start
        </motion.button>
      </div>
    </motion.section>
  );
}
