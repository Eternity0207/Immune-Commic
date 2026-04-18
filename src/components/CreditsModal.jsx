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
          <p className="credits-value">Dr. Sunil Lohar</p>
        </div>

        <div className="credits-group">
          <p className="credits-label">Students</p>
          <p className="credits-value">Arsh Goyal</p>
          <p className="credits-value">Gyan Vardhan Chauhan</p>
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
