import { useEffect, useRef, useState } from "react";

export default function CharacterIntroPage({ characters, onContinue }) {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const maxScrollLeft = Math.max(
      carousel.scrollWidth - carousel.clientWidth,
      0,
    );
    setCanScrollLeft(carousel.scrollLeft > 8);
    setCanScrollRight(carousel.scrollLeft < maxScrollLeft - 8);
  };

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return undefined;
    }

    updateScrollButtons();

    const onScroll = () => updateScrollButtons();
    const onResize = () => updateScrollButtons();

    carousel.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      carousel.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [characters.length]);

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const firstCard = carousel.querySelector(".character-carousel-item");
    const computed = window.getComputedStyle(carousel);
    const gap = Number.parseFloat(computed.columnGap || computed.gap || "0");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 280;
    const distance = cardWidth + gap;

    carousel.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <section
      className="character-intro-stage"
      aria-label="Character introduction"
    >
      <header className="character-intro-header">
        <div className="character-title-block">
          <h1>Meet The Immune Team</h1>
        </div>
        <p>Use the side buttons to move through each character card.</p>
      </header>

      <div className="character-carousel-shell">
        <button
          type="button"
          className="character-carousel-nav character-carousel-nav-left"
          onClick={() => scrollCarousel(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll characters left"
        >
          {"\u2039"}
        </button>

        <div
          ref={carouselRef}
          className="character-carousel"
          role="list"
          aria-label="Immune characters carousel"
        >
          {characters.map((character) => {
            const description = character.description.trim();

            return (
              <figure
                key={character.id}
                className="character-carousel-item"
                role="listitem"
              >
                <div className="character-carousel-image-wrap">
                  <img
                    className="character-carousel-image"
                    src={character.image}
                    alt={character.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="character-carousel-meta">
                  <h2>{character.name}</h2>
                  <p>{description}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <button
          type="button"
          className="character-carousel-nav character-carousel-nav-right"
          onClick={() => scrollCarousel(1)}
          disabled={!canScrollRight}
          aria-label="Scroll characters right"
        >
          {"\u203A"}
        </button>
      </div>

      <footer className="character-intro-footer">
        <button
          type="button"
          className="continue-story-btn"
          onClick={onContinue}
        >
          Continue to Comic Story
        </button>
      </footer>
    </section>
  );
}
