import useRevealOnView from "../hooks/useRevealOnView";

export default function Panel({ panel, onTermClick }) {
  const [panelRef, isVisible] = useRevealOnView({ threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  return (
    <article ref={panelRef} className={`comic-panel ${isVisible ? "is-visible" : ""}`}>
      <div className="comic-panel-image-wrap">
        <img
          src={panel.image}
          alt={`Comic panel ${panel.number}`}
          loading="lazy"
          decoding="async"
          className="comic-panel-image"
        />
      </div>
      <p className="comic-panel-caption">{panel.caption}</p>

      {panel.terms?.length ? (
        <div className="comic-panel-terms" aria-label={`Technical terms for panel ${panel.number}`}>
          <span className="panel-terms-label">Key terms:</span>
          {panel.terms.map((term) => (
            <button
              key={`${panel.number}-${term}`}
              type="button"
              className="panel-term-btn"
              onClick={(event) => {
                event.stopPropagation();
                onTermClick?.(term);
              }}
              onKeyDown={(event) => {
                event.stopPropagation();
              }}
            >
              Learn more: {term}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
