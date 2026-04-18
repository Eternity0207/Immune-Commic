import { motion } from "framer-motion";
import { useRef, useState } from "react";
import CharacterModal from "./CharacterModal";

export default function Characters({ characters, onEnterStory, onCharacterHover, onCharacterClick, onActionClick }) {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const lastHoverRef = useRef({ index: -1, time: 0 });

  const openCharacter = (character) => {
    onCharacterClick?.();
    setSelectedCharacter(character);
  };

  const handleHover = (index) => {
    const now = Date.now();
    if (lastHoverRef.current.index === index && now - lastHoverRef.current.time < 220) return;
    lastHoverRef.current = { index, time: now };
    onCharacterHover?.();
  };

  return (
    <motion.section
      key="characters"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_12%,#1b2742_0%,#0b1120_52%,#05070d_100%)] px-4 py-8"
    >
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:40px_40px]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <h2 className="text-center font-['Baloo_2'] text-4xl font-extrabold text-ink sm:text-5xl">Meet the Immune Team</h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {characters.map((character, index) => (
            <motion.article
              key={character.name}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              whileHover={{ scale: 1.05, y: -6 }}
              className="group cursor-pointer rounded-3xl border border-white/15 bg-white/10 p-2 shadow-scene backdrop-blur transition-[box-shadow,transform] hover:shadow-[0_18px_40px_rgba(56,189,248,0.24)]"
              style={{ animation: `floaty 4.2s ease-in-out ${index * 0.14}s infinite` }}
              onClick={() => openCharacter(character)}
              onMouseEnter={() => handleHover(index)}
            >
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={character.image}
                  alt={character.name}
                  className="aspect-[4/3] h-auto w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <p className="px-2 pb-1 pt-2 text-center text-sm font-extrabold text-ink">{character.name}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-7 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onActionClick?.();
              onEnterStory();
            }}
            className="rounded-full bg-cyan-300 px-8 py-3 text-sm font-extrabold text-slate-900 shadow-scene transition hover:shadow-[0_0_34px_rgba(56,189,248,0.55)]"
            type="button"
          >
            Enter Story
          </motion.button>
        </div>
      </div>

      <CharacterModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
    </motion.section>
  );
}
