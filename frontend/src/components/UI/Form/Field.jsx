export default function Field({
  label,
  error,
  required,
  valid,
  verificationStatus,
  children,
}) {
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          <span>
            {label}
            {required && <span className="required">*</span>}
          </span>

          {verificationStatus && (
            <span
              className={`verification-pill ${verificationStatus.status}`}
            >
              {verificationStatus.status === "verified"
                ? "✓ Verified"
                : "✕ Unverified"}
            </span>
          )}
        </label>
      )}

      {children}

      {error && <div className="field-error">{error}</div>}
    </div>
  );
}