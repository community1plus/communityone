import React from "react";
import "./TwoColumnLayout.css";

export default function TwoColumnLayout({ left, right }) {
  return (
    <div className="two-col-container">
      <div className="two-col-layout">

        <div className="two-col-left">
          {left}
        </div>

        <div className="two-col-right">
          {right}
        </div>

      </div>
    </div>
  );
}