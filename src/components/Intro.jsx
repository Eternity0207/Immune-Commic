import { memo } from "react";

function CharacterCard({ character, onCharacterClick }) {
  return (
    <button
      type="button"
      className="group w-44 shrink-0 rounded-2xl border border-white/25 bg-white/8 p-4 text-left backdrop-blur-sm transition duration-300 hover:scale-105 hover:border-cyan-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
      onClick={(event) => onCharacterClick(character, event)}
    >
      <img
        src={character.img}
        alt={character.name}
        className="h-28 w-full rounded-xl object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <h3 className="mt-3 text-base font-semibold text-white">{character.name}</h3>
      <p className="mt-1 text-sm text-slate-200">{character.role}</p>
    </button>
  );
}

const Intro = memo(function Intro({ characters, onCharacterClick, onStartStory }) {
  return (
    <section className="relative z-10 h-screen w-full px-6 py-8">
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/85">Visual Immune Comic</p>
        <h1 className="mt-3 text-center text-4xl font-bold tracking-tight text-white md:text-6xl">Inside Your Immune System</h1>
        <p className="mt-4 max-w-2xl text-center text-base text-slate-200 md:text-lg">
          Meet the cast, tap any character for context, then begin one continuous story scroll.
        </p>

        <div className="mt-10 flex w-full max-w-6xl gap-6 overflow-x-auto px-2 pb-3">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} onCharacterClick={onCharacterClick} />
          ))}
        </div>

        <button
          type="button"
          onClick={onStartStory}
          className="mt-10 rounded-full border border-cyan-200/40 bg-cyan-200/12 px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-200/24 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        >
          Start Story
        </button>
      </div>
    </section>
  );
});

export default Intro;
