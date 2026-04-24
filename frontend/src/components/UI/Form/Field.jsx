export default function Field({
  label,
  hint,
  error,
  success,
  loading,
  children,
}) {
  /* =========================
     STATE FLAGS
  ========================= */

  const hasError = !!error;
  const isSuccess = !!success && !hasError && !loading;

  /* =========================
     RENDER
  ========================= */

  return (
    <div
      className={`field 
        ${hasError ? "field-error-state" : ""}
        ${isSuccess ? "field-success-state" : ""}
        ${loading ? "field-loading-state" : ""}
      `}
    >
      {/* LABEL */}
      {label && (
        <label className="field-label">
          {label}

          {/* STATUS INDICATORS */}
          <span className="field-status">
            {loading && <span className="field-loading">⏳</span>}
            {isSuccess && <span className="field-success">✓</span>}
          </span>
        </label>
      )}

      {/* INPUT */}
      <div className="field-control">{children}</div>

      {/* HINT */}
      {!error && hint && (
        <div className="field-hint">{hint}</div>
      )}

      {/* ERROR */}
      {error && (
        <div className="field-error">
          {error}
        </div>
      )}
    </div>
  );
}