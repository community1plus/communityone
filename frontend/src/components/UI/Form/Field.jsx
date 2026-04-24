export default function Field({ label, hint, error, children }) {
  return (
    <div className="field">

      {label && <label className="field-label">{label}</label>}

      {children}

      {hint && <div className="field-hint">{hint}</div>}
      {error && <div className="field-error">{error}</div>}

    </div>
  );
}