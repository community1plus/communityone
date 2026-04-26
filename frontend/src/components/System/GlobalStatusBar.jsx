import { useUI } from "../../context/UIContext";
import "./GlobalStatusBar.css";

export default function GlobalStatusBar() {
  const { isLoading, saving, saved } = useUI();

  return (
    <>
      {/* 🔥 LOADING BAR */}
      {isLoading && <div className="top-loader" />}

      {/* 🔥 SAVE STATUS */}
      {(saving || saved) && (
        <div className="save-indicator">
          {saving && "Saving..."}
          {saved && "Saved ✓"}
        </div>
      )}
    </>
  );
}