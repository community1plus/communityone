export default function PageHeader({ title, meta, right }) {
  return (
    <div className="page-header">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="section-title">{title}</div>
          {meta && <div className="section-meta">{meta}</div>}
        </div>

        {right && <div>{right}</div>}
      </div>
    </div>
  );
}