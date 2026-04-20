import { AnimatePresence, motion } from "framer-motion";

export default function InfoOverlay({ info, anchor, onClose }) {
  return (
    <AnimatePresence>
      {info ? (
        <motion.div
          key={info.title}
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute z-40 w-[min(84vw,320px)] rounded-2xl border border-cyan-100/25 bg-white/10 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          style={{
            left: `clamp(10px, calc(${anchor.x}% - 120px), calc(100% - 330px))`,
            top: `clamp(10px, calc(${anchor.y}% - 10px), calc(100% - 230px))`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-100"
          >
            Close
          </button>

          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200">Knowledge Layer</p>
          <h3 className="mt-1 text-lg font-extrabold text-white">{info.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-100/95">{info.description}</p>

          {info.link ? (
            <a
              href={info.link}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full border border-cyan-100/30 bg-cyan-200/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-cyan-100 transition hover:scale-[1.03]"
            >
              Learn more
            </a>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
