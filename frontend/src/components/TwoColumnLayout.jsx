import React from "react";
import "./TwoColumnLayout.css";

export default function TwoColumnLayout({
  left,
  right,
  fullWidth = false,
  mapMode = false,
}) {
  return (
    <div className={`two-col-container ${fullWidth ? "full-width" : ""}`}>
      <div className={`two-col-layout ${mapMode ? "map-mode" : ""}`}>
        <div className="two-col-left">{left}</div>

        <div className="two-col-right">{right}</div>
      </div>
    </div>
  );
}