export default function Section({ title, meta, children }) {
  return (
    <div className="section">
      {title && <div className="section-title">{title}</div>}
      {meta && <div className="section-meta">{meta}</div>}
      {children}
    </div>
  );
}