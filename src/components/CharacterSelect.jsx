import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

export default function CharacterSelect({ characters, selectedIndex, onChange, onConfirm }) {
  const dragStartXRef = useRef(0);

  const selectedCharacter = useMemo(() => characters[selectedIndex], [characters, selectedIndex]);

  const moveLeft = () => onChange((selectedIndex - 1 + characters.length) % characters.length);
  const moveRight = () => onChange((selectedIndex + 1) % characters.length);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft") moveLeft();
      if (event.key === "ArrowRight") moveRight();
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <motion.section
      key="character-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_15%,#0f2742_0%,#070e1b_52%,#020611_100%)]"
      onPointerDown={(event) => {
        dragStartXRef.current = event.clientX;
      }}
      onPointerUp={(event) => {
        const delta = event.clientX - dragStartXRef.current;
        if (Math.abs(delta) < 38) return;
        if (delta > 0) moveLeft();
        else moveRight();
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.22)_1px,transparent_0)] [background-size:42px_42px] opacity-35" />

      <div className="relative z-10 w-full max-w-6xl px-6">
        <h2 className="text-center text-xs font-black uppercase tracking-[0.35em] text-cyan-200/95">Select Unit</h2>

        <div className="relative mt-10 h-72 sm:h-80">
          {characters.map((character, index) => {
            const count = characters.length;
            const rawOffset = index - selectedIndex;
            const offset = ((rawOffset + count + Math.floor(count / 2)) % count) - Math.floor(count / 2);
            const absOffset = Math.abs(offset);
            const isCenter = offset === 0;

            return (
              <motion.button
                key={character.name}
                type="button"
                onClick={() => onChange(index)}
                animate={{
                  x: offset * 148,
                  y: absOffset * 26,
                  scale: isCenter ? 1 : Math.max(0.64, 0.82 - absOffset * 0.04),
                  opacity: absOffset > 4 ? 0 : 1,
                  filter: `blur(${isCenter ? 0 : Math.min(4, absOffset * 1.15)}px)`,
                  zIndex: isCenter ? 10 : 10 - absOffset,
                }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
                className={`absolute left-1/2 top-1/2 w-36 -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-2 text-center backdrop-blur-sm sm:w-40 ${
                  isCenter
                    ? "border-cyan-200/70 bg-cyan-300/15 shadow-[0_0_26px_rgba(34,211,238,0.5)]"
                    : "border-white/20 bg-white/5"
                }`}
              >
                <img src={character.image} alt={character.name} className="h-24 w-full rounded-xl object-cover sm:h-28" />
                <p className="mt-2 text-sm font-black text-white">{character.name}</p>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          key={selectedCharacter.name}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-4 w-[min(92vw,660px)] rounded-2xl border border-white/20 bg-black/45 px-4 py-4 text-center backdrop-blur-sm"
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Focused Unit</p>
          <h3 className="mt-1 text-2xl font-extrabold text-white">{selectedCharacter.name}</h3>
          <p className="mt-2 text-sm font-bold text-slate-200">{selectedCharacter.intro}</p>
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={moveLeft}
            className="rounded-full border border-white/25 bg-black/40 px-4 py-2 text-xs font-black uppercase tracking-[0.08em]"
          >
            Prev
          </button>
          <motion.button
            type="button"
            onClick={onConfirm}
            whileHover={{ scale: 1.06, boxShadow: "0 0 26px rgba(56,189,248,0.45)" }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full border border-cyan-100/35 bg-cyan-300/20 px-6 py-2 text-xs font-black uppercase tracking-[0.1em] text-cyan-50"
          >
            Deploy Unit
          </motion.button>
          <button
            type="button"
            onClick={moveRight}
            className="rounded-full border border-white/25 bg-black/40 px-4 py-2 text-xs font-black uppercase tracking-[0.08em]"
          >
            Next
          </button>
        </div>

        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-300/80">
          Use arrow keys or drag to switch
        </p>
      </div>
    </motion.section>
  );
}
