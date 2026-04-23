import React, { useState, useMemo, useCallback } from "react";

import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";
import CommunityPlusAdSlotDial from "../CommunityPlusAdSlotDial/CommunityPlusAdSlotDial";
import "./CommunityPlusAdTvPage.css";

const MODES = ["live", "schedule", "upload"];

export default function CommunityPlusAdTvPage() {
  const [tvMode, setTvMode] = useState("live");
  const [selectedSlot, setSelectedSlot] = useState(null);

  /* =========================
     DATA
  ========================= */
  const slots = useMemo(
    () =>
      Array.from({ length: 24 }, () => ({
        count: Math.floor(Math.random() * 5),
        capacity: 5,
      })),
    []
  );

  /* =========================
     HANDLERS
  ========================= */
  const handleSelectSlot = useCallback((hour) => {
    setSelectedSlot(hour);
    setTvMode("schedule");
  }, []);

  const handleModeChange = useCallback((mode) => {
    setTvMode(mode);
  }, []);

  const selectedLabel =
    selectedSlot !== null ? `Selected: ${selectedSlot}:00` : "Select an hour";

  /* =========================
     UI
  ========================= */
  return (
    <div className="adtv-container">

      {/* HEADER */}
      <div className="adtv-header">
        <h1 className="h1">
          AD.TV <span className="adtv-sp">SP</span>
        </h1>

        <div className="adtv-live">● LIVE</div>

        <div className="meta">
          LIVE AD CHANNEL • LOCATION-AWARE • TIME-BASED
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="adtv-layout">

        {/* LEFT COLUMN */}
        <div className="adtv-left">

          {/* TV */}
          <div className="adtv-stage">
            <div className="adtv-tv-container">
              <CommunityPlusAdTv
                mode="page"
                context="page"
                tvMode={tvMode}
                selectedSlot={selectedSlot}
              />
            </div>
          </div>

          {/* MODE SWITCH */}
          <div className="adtv-mode-bar">
            {MODES.map((mode) => (
              <button
                key={mode}
                className={`btn btn-ghost ${
                  tvMode === mode ? "active" : ""
                }`}
                onClick={() => handleModeChange(mode)}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* NOW PLAYING */}
          <div className="adtv-section">
            <h2 className="h2">Now Playing</h2>
            <div className="meta">CURRENT AD STREAM</div>

            <div className="adtv-mini-preview">
              {selectedSlot !== null
                ? `Preview for ${selectedSlot}:00 slot`
                : "Active campaign preview"}
            </div>
          </div>

          {/* UPCOMING */}
          <div className="adtv-section">
            <h2 className="h2">Upcoming Slots</h2>
            <div className="meta">SCHEDULED ADS</div>

            <div className="adtv-slot-list">
              <div>18:00 — Restaurant Promo</div>
              <div>19:00 — Event Ad</div>
              <div>20:00 — Local Business</div>
            </div>
          </div>

          {/* UPLOAD */}
          <div className="adtv-section">
            <h2 className="h2">Upload / Preview</h2>
            <div className="meta">CREATE AND TEST ADS</div>

            <button
              className="btn btn-primary"
              onClick={() => handleModeChange("upload")}
            >
              Upload Ad
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN (DIAL / CONTROL PANEL) */}
        <div className="adtv-right">

          <div className="adtv-panel">
            <div className="h3">Book Slot</div>
            <div className="meta">{selectedLabel}</div>

            <CommunityPlusAdSlotDial
              slots={slots}
              onSelectSlot={handleSelectSlot}
            />
          </div>

        </div>

      </div>
    </div>
  );
}