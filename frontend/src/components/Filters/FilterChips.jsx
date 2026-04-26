import "./FilterChips.css";
import { useMap } from "../../context/MapContext";
import { CATEGORIES } from "../../config/categories";

export default function FilterChips() {
  const {
    mode,
    scope,
    category,
    setMode,
    setScope,
    setCategory,
  } = useMap();

  const categoryMeta = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="filter-chips">

      {/* SCOPE */}
      <div className="chip">
        📍 {scope}
      </div>

      {/* MODE */}
      <div
        className="chip clickable"
        onClick={() => setMode(mode === "NOW" ? "BLOB" : "NOW")}
      >
        {mode === "NOW" ? "⚡ NOW" : "🧠 BLOB"}
      </div>

      {/* CATEGORY */}
      {categoryMeta && (
        <div
          className="chip removable"
          onClick={() => setCategory(null)}
        >
          {categoryMeta.icon} {categoryMeta.label} ✕
        </div>
      )}

    </div>
  );
}