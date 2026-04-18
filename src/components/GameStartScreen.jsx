import { motion } from "framer-motion";
import GameCanvas from "./GameCanvas";

export default function GameStartScreen({ onStart }) {
  return (
    <motion.section
      key="game-start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#020816]"
    >
      <GameCanvas mode="menu" sceneType="menu" actionPulse={0} />

      <motion.div
        animate={{ x: [0, 8, -6, 0], y: [0, -6, 5, 0], scale: [1, 1.015, 0.99, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-[-10%] bg-[radial-gradient(circle_at_32%_30%,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_70%_72%,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_20%_80%,rgba(96,165,250,0.15),transparent_35%)]"
      />

      <div className="relative z-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200/90">Story Mode</p>
        <h1 className="mt-5 font-['Baloo_2'] text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl md:text-7xl">
          INSIDE YOUR
          <br />
          IMMUNE SYSTEM
        </h1>

        <motion.button
          type="button"
          onClick={onStart}
          whileHover={{ scale: 1.06, boxShadow: "0 0 28px rgba(45,212,191,0.6)" }}
          whileTap={{ scale: 0.96 }}
          className="mt-12 rounded-full border border-cyan-200/35 bg-cyan-300/20 px-8 py-3 text-sm font-black uppercase tracking-[0.12em] text-cyan-50 backdrop-blur-sm"
        >
          Start Simulation
        </motion.button>
      </div>
    </motion.section>
  );
}
