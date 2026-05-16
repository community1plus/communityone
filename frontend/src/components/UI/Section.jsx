export default function Section({
  title,
  meta,
  children,
  actions,
  className = "",
}) {
  return (
    <section className={["section", className].filter(Boolean).join(" ")}>
      {(title || meta || actions) && (
        <header className="section-header">
          <div>
            {meta && <div className="section-meta">{meta}</div>}
            {title && <h2 className="section-title">{title}</h2>}
          </div>

          {actions && <div className="section-actions">{actions}</div>}
        </header>
      )}

      <div className="section-body">{children}</div>
    </section>
  );
}