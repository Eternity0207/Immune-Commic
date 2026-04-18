import { motion } from "framer-motion";

export default function InfoCard({ info, onClose }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="fixed z-[130] w-[260px] rounded-2xl border border-white/30 bg-[rgba(0,0,0,0.85)] p-4 text-sm text-white shadow-[0_24px_80px_rgba(0,0,0,0.72)]"
      style={{ left: info.x, top: info.y }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.72rem] uppercase tracking-[0.22em] text-cyan-200">Immune Note</p>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-xs text-slate-100 transition hover:bg-white/10"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <h2 className="mt-2 text-lg font-semibold leading-tight">{info.title}</h2>
      <p className="mt-2 leading-relaxed text-white/95">{info.desc}</p>

      <a
        href={info.link}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-xs uppercase tracking-[0.16em] text-cyan-100 underline decoration-cyan-300/70 underline-offset-2"
      >
        Wikipedia
      </a>
    </motion.aside>
  );
}
