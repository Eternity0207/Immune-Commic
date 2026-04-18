export default function CharacterIntroPage({ characters, onContinue }) {
  return (
    <section className="character-intro-stage" aria-label="Character introduction">
      <header className="character-intro-header">
        <p className="character-intro-kicker">Start Here</p>
        <h1>Meet The Immune Team</h1>
        <p>Swipe or scroll horizontally to explore each character before entering the story.</p>
      </header>

      <div className="character-carousel" role="list" aria-label="Immune characters carousel">
        {characters.map((character) => {
          const roleLine = character.description.split(".").find(Boolean)?.trim() || character.description.trim();
          const conciseRole = roleLine.length > 96 ? `${roleLine.slice(0, 93).trim()}...` : roleLine;

          return (
            <figure key={character.id} className="character-carousel-item" role="listitem">
              <div className="character-carousel-image-wrap">
                <img className="character-carousel-image" src={character.image} alt={character.name} loading="lazy" decoding="async" />
              </div>
              <figcaption className="character-carousel-meta">
                <h2>{character.name}</h2>
                <p>{conciseRole}</p>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <footer className="character-intro-footer">
        <button type="button" className="continue-story-btn" onClick={onContinue}>
          Continue to Comic Story
        </button>
      </footer>
    </section>
  );
}
