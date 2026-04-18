export default function CharacterSection({ characters }) {
  return (
    <section className="sidebar-section">
      <h3>Character Section</h3>
      <p className="sidebar-intro">Meet the immune cast. Each profile includes a short explanation and a learn-more link.</p>
      <ul className="character-list" aria-label="Character list">
        {characters.map((character) => (
          <li key={character.id} className="character-list-item">
            <img src={character.image} alt={character.name} loading="lazy" decoding="async" />
            <div>
              <h4>{character.name}</h4>
              <p>{character.description}</p>
              <a href={character.link} target="_blank" rel="noreferrer noopener">
                Learn more
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
