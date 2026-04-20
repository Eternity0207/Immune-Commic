export default function CharacterSection({ characters }) {
  return (
    <section className="sidebar-section">
      <h3>Characters</h3>
      <p className="sidebar-intro">Meet the immune cast and use these profiles as quick revision cards while reading.</p>
      <ul className="character-list" aria-label="Character list">
        {characters.map((character) => (
          <li key={character.id} className="character-list-item">
            <img src={character.image} alt={character.name} loading="lazy" decoding="async" />
            <div>
              <h4>{character.name}</h4>
              <p>{character.description}</p>
              {character.link ? (
                <a href={character.link} target="_blank" rel="noreferrer noopener">
                  Learn more
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
