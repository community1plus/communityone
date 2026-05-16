import React from "react";
import "./TwoColumnLayout.css";

export default function TwoColumnLayout({
  left,
  right,

  leftWidth = "1fr",
  rightWidth = "1fr",

  gap = "32px",

  fullWidth = false,
  mapMode = false,
  align = "start",

  className = "",
}) {
  return (
    <div
      className={[
        "two-col-container",
        fullWidth && "full-width",
        mapMode && "map-mode",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="two-col-layout"
        style={{
          gridTemplateColumns: `${leftWidth} ${rightWidth}`,
          gap,
          alignItems: align,
        }}
      >
        <div className="two-col-left">{left}</div>

        <div className="two-col-right">{right}</div>
      </div>
    </div>
  );
}