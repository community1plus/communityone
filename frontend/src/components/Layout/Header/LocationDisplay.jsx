import { useState } from "react";
import { useUserLocation } from "../../../hooks/useUserLocation";

export default function LocationDisplay() {
  const { location, loading, error, refetch } = useUserLocation();

  const [mode, setMode] = useState("auto");
  const [input, setInput] = useState("");

  const toggleMode = () => {
    if (mode === "auto") {
      setMode("manual");
    } else {
      setMode("auto");
      refetch();
    }
  };

  /* SAFE LABEL */
  const label = loading
    ? "Detecting..."
    : location?.label || "Set location";

  const pinColor = loading
    ? "#999"
    : location
    ? "#2ecc71"
    : "#e74c3c";

  return (
    <div className="location-display">

      <span
        onClick={toggleMode}
        style={{ color: pinColor, cursor: "pointer" }}
      >
        📍
      </span>

      {mode === "auto" ? (
        <span>{label}</span>
      ) : (
        <input
          placeholder="Enter location..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      )}

      {/* DEBUG SAFETY */}
      {error && (
        <span style={{ color: "red", fontSize: 10 }}>
          {error}
        </span>
      )}

    </div>
  );
}