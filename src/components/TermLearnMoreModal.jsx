import { useEffect, useMemo, useState } from "react";
import { TERM_REFERENCES } from "../lib/termData";

export default function TermLearnMoreModal({ termKey, onClose, onUiClick }) {
  const [state, setState] = useState({
    loading: false,
    summary: "",
    title: "",
    link: "",
    source: ""
  });

  const reference = useMemo(() => TERM_REFERENCES[termKey] ?? null, [termKey]);

  useEffect(() => {
    if (!termKey) {
      return undefined;
    }

    const hasExplicitNoWiki = Boolean(reference) && !reference?.wikiPage;
    const wikiPage = hasExplicitNoWiki ? "" : reference?.wikiPage ?? termKey;
    const fallbackTitle = reference?.title ?? termKey;
    const fallbackSummary = reference?.fallback ?? "No additional summary is available for this term yet.";
    const fallbackLink = wikiPage ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiPage)}` : "";

    if (!wikiPage) {
      setState({
        loading: false,
        summary: fallbackSummary,
        title: fallbackTitle,
        link: "",
        source: "fallback"
      });

      return undefined;
    }

    const controller = new AbortController();

    const fetchSummary = async () => {
      setState({
        loading: true,
        summary: fallbackSummary,
        title: fallbackTitle,
        link: fallbackLink,
        source: "fallback"
      });

      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Wikipedia request failed");
        }

        const data = await response.json();

        setState({
          loading: false,
          title: data.title || fallbackTitle,
          summary: data.extract || fallbackSummary,
          link: data.content_urls?.desktop?.page || fallbackLink,
          source: "wikipedia"
        });
      } catch {
        setState({
          loading: false,
          title: fallbackTitle,
          summary: fallbackSummary,
          link: fallbackLink,
          source: "fallback"
        });
      }
    };

    fetchSummary();

    return () => controller.abort();
  }, [reference, termKey]);

  if (!termKey) {
    return null;
  }

  return (
    <div className="learn-modal-layer" role="dialog" aria-modal="true" aria-labelledby="learn-modal-title">
      <button
        type="button"
        className="learn-modal-backdrop"
        onClick={() => {
          onUiClick?.();
          onClose();
        }}
        aria-label="Close learn more modal"
      />

      <section className="learn-modal-card">
        <p className="learn-modal-kicker">Learn More</p>
        <h3 id="learn-modal-title">{state.title || termKey}</h3>

        <p className="learn-modal-summary">{state.summary}</p>

        <div className="learn-modal-footer">
          <span className="learn-modal-source">
            {state.loading ? "Fetching Wikipedia summary..." : state.source === "wikipedia" ? "Source: Wikipedia" : "Source: Built-in note"}
          </span>

          {state.link ? (
            <a href={state.link} target="_blank" rel="noreferrer noopener" className="learn-modal-link">
              Read Full Article
            </a>
          ) : null}
        </div>

        <button
          type="button"
          className="learn-modal-close-btn"
          onClick={() => {
            onUiClick?.();
            onClose();
          }}
        >
          Close
        </button>
      </section>
    </div>
  );
}
