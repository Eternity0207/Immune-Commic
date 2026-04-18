import { motion } from "framer-motion";
import GameCanvas from "./GameCanvas";
import GameDialogue from "./GameDialogue";

const THEME = {
  pathogen: "from-emerald-400/10 via-red-500/15 to-cyan-400/10",
  response: "from-cyan-400/12 via-emerald-400/15 to-red-400/12",
  attack: "from-blue-400/14 via-red-500/18 to-cyan-300/12",
  failure: "from-red-600/24 via-orange-500/20 to-red-700/22",
  memory: "from-yellow-300/15 via-cyan-300/10 to-violet-500/14",
  victory: "from-emerald-400/18 via-cyan-400/12 to-yellow-300/16",
};

export default function StoryScene({
  scene,
  sceneIndex,
  totalScenes,
  character,
  actionPulse,
  onAction,
  onNext,
  onBackToMenu,
}) {
  const progressPct = ((sceneIndex + 1) / totalScenes) * 100;

  return (
    <motion.section
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative h-full w-full overflow-hidden bg-[#010611]"
      onClick={onAction}
    >
      <GameCanvas mode="story" sceneType={scene.type} actionPulse={actionPulse} />

      <div className={`absolute inset-0 bg-gradient-to-br ${THEME[scene.type] || THEME.pathogen}`} />

      <motion.div
        animate={{ x: [0, 6, -5, 0], y: [0, -4, 5, 0], scale: [1, 1.012, 0.994, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-[-8%] bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_72%_65%,rgba(248,113,113,0.18),transparent_35%)]"
      />

      <div className="absolute left-4 top-4 z-30 w-[min(92vw,380px)] rounded-2xl border border-white/20 bg-black/45 px-4 py-3 backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-200">{scene.level}</p>
        <h2 className="mt-1 text-lg font-extrabold text-white sm:text-xl">{scene.title}</h2>
        <p className="text-xs font-bold text-slate-200">Objective: {scene.objective}</p>

        <div className="mt-3 h-2 rounded-full bg-slate-700/50">
          <div className="h-2 rounded-full bg-cyan-300/85 transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-300">
          Stage {sceneIndex + 1} / {totalScenes}
        </p>
      </div>

      <div className="absolute right-4 top-16 z-30 rounded-2xl border border-white/20 bg-black/45 px-3 py-2 backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-cyan-200">Active Unit</p>
        <p className="text-sm font-extrabold text-white">{character.name}</p>
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onBackToMenu();
          }}
          className="rounded-full border border-white/25 bg-black/45 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em]"
        >
          Exit
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          className="rounded-full border border-cyan-200/35 bg-cyan-300/18 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-cyan-50"
        >
          Next Level
        </button>
      </div>

      <motion.button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAction();
        }}
        whileHover={{ scale: 1.06, boxShadow: "0 0 30px rgba(125,211,252,0.45)" }}
        whileTap={{ scale: 0.95 }}
        className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/35 bg-cyan-200/12 px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-cyan-50 backdrop-blur-sm"
      >
        Trigger Action
      </motion.button>

      <GameDialogue speaker={scene.speaker} text={scene.dialogue} />

      <div className="pointer-events-none absolute bottom-28 right-4 z-30 rounded-xl border border-white/20 bg-black/45 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-200/90 backdrop-blur-sm">
        Scroll / Arrow keys to change level
      </div>
    </motion.section>
  );
}
