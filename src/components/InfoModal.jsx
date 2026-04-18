import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export default function InfoModal({ open, info, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && info ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-full max-w-2xl rounded-3xl border border-white/20 bg-[#0b1120]/95 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-ink sm:text-3xl">{info.title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-black text-ink transition hover:scale-105"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-100/95 sm:text-base">{info.content}</p>

            <a
              href={info.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-cyan-100 transition hover:scale-105 hover:bg-cyan-300/20"
            >
              Read More (Wikipedia / Source)
            </a>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}