import "./CommunityPlusHub.css";
import { useNavigate } from "react-router-dom";
import { useMap } from "../../context/MapContext";
import { categories } from "../../config/navigation/categories
import { useCallback } from "react";

export default function CommunityPlusHub() {
  const navigate = useNavigate();

  const {
    mode,
    category,
    setMode,
    setCategory,
  } = useMap();

  /* =========================
     CLICK HANDLER (🔥 CORE)
  ========================= */

  const handleCategoryClick = useCallback(
    (cat) => {
      // 🔥 toggle behaviour
      const isSame = category === cat.id;

      setMode(cat.mode);
      setCategory(isSame ? null : cat.id);

      navigate("/communityplus");
    },
    [category, setMode, setCategory, navigate]
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="communityplus-container">
      <h2>Community+</h2>

      <div className="cp-grid">
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;

          return (
            <div
              key={cat.id}
              className={`cp-card ${active ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {/* IMAGE */}
              <div
                className="cp-image"
                style={{
                  backgroundImage: `url(https://source.unsplash.com/600x400/?${cat.image})`,
                }}
              />

              {/* CONTENT */}
              <div className="cp-content">
                <h3>
                  {cat.icon} {cat.label}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}