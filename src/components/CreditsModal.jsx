const CREDIT_LINKS = {
  "Dr. Sunil Lohar": "https://iitj.ac.in/People/Profile/5ee5e2a2-ebcc-471c-9287-3987cdac57e2",
  "Arsh Goyal": "https://www.linkedin.com/in/arshgoyal0607/",
  "Gyan Vardhan Chauhan": "https://www.linkedin.com/in/gyan-vardhan-chauhan/"
};

export default function CreditsModal({ isOpen, onClose, onUiClick }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="credits-modal-layer" role="dialog" aria-modal="true" aria-labelledby="credits-title">
      <button
        type="button"
        className="credits-modal-backdrop"
        onClick={() => {
          onUiClick?.();
          onClose();
        }}
        aria-label="Close credits"
      />

      <section className="credits-modal-card">
        <h2 id="credits-title">Project Credits</h2>

        <div className="credits-group">
          <p className="credits-label">Project Title</p>
          <p className="credits-value">Immune System Comic Learning Experience</p>
        </div>

        <div className="credits-group">
          <p className="credits-label">Professor</p>
          <a
            className="credits-link"
            href={CREDIT_LINKS["Dr. Sunil Lohar"]}
            target="_blank"
            rel="noreferrer"
          >
            Dr. Sunil Lohar
          </a>
        </div>

        <div className="credits-group">
          <p className="credits-label">Students</p>
          <a className="credits-link" href={CREDIT_LINKS["Arsh Goyal"]} target="_blank" rel="noreferrer">
            Arsh Goyal
          </a>
          <a
            className="credits-link"
            href={CREDIT_LINKS["Gyan Vardhan Chauhan"]}
            target="_blank"
            rel="noreferrer"
          >
            Gyan Vardhan Chauhan
          </a>
        </div>

        <button
          type="button"
          className="credits-close-btn"
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
