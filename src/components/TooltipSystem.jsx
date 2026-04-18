import { AnimatePresence, motion } from "framer-motion";

export default function TooltipSystem({ hotspot }) {
  return (
    <AnimatePresence>
      {hotspot ? (
        <motion.div
          key={hotspot.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.16 }}
          className="pointer-events-none absolute z-30 -translate-x-1/2 rounded-lg border border-white/25 bg-black/45 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-100 backdrop-blur"
          style={{ left: `${hotspot.x}%`, top: `calc(${hotspot.y}% - 30px)` }}
        >
          {hotspot.label}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
