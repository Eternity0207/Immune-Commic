import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export default function CharacterModal({ character, onClose }) {
  useEffect(() => {
    if (!character) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [character, onClose]);

  return (
    <AnimatePresence>
      {character ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-full max-w-md rounded-3xl border border-white/20 bg-[#0c1222]/90 p-4 shadow-[0_24px_80px_rgba(5,12,30,0.65)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl border border-white/15">
              <img src={character.image} alt={character.name} className="h-60 w-full object-cover" />
            </div>

            <div className="mt-4 px-1">
              <h3 className="font-['Baloo_2'] text-3xl font-extrabold text-ink">{character.name}</h3>
              <p className="mt-2 text-sm font-bold text-slate-200/95">{character.bio}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}