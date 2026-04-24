import React, { useState, useMemo, useCallback } from "react";

import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";
import CommunityPlusAdSlotDial from "../CommunityPlusAdSlotDial/CommunityPlusAdSlotDial";

import "../../styles/system.css"; // 🔥 system layer

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

  /* =========================
     DERIVED
  ========================= */
  const selectedLabel =
    selectedSlot !== null ? `Selected: ${selectedSlot}:00` : "Select an hour";

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="page-header">
        <h1 className="section-title">Channels</h1>
        <div className="section-meta">
          LIVE AD CHANNEL • LOCATION-AWARE • TIME-BASED
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="page-layout">

        {/* LEFT */}
        <div className="card card-primary">

          {/* TV */}
          <div className="adtv-tv-container">
            <CommunityPlusAdTv
              mode="page"
              context="page"
              tvMode={tvMode}
              selectedSlot={selectedSlot}
            />
          </div>

          {/* MODE SWITCH */}
          <div className="adtv-mode-bar">
            {MODES.map((mode) => {
              const isActive = tvMode === mode;

              return (
                <button
                  key={mode}
                  className={`btn btn-ghost ${isActive ? "active" : ""}`}
                  onClick={() => handleModeChange(mode)}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              );
            })}
          </div>

          {/* NOW PLAYING */}
          <div className="section">
            <div className="section-title">Now Playing</div>
            <div className="section-meta">CURRENT AD STREAM</div>

            <div className="adtv-mini-preview">
              {selectedSlot !== null
                ? `Preview for ${selectedSlot}:00 slot`
                : "Active campaign preview"}
            </div>
          </div>

          {/* UPCOMING */}
          <div className="section">
            <div className="section-title">Upcoming Slots</div>
            <div className="section-meta">SCHEDULED ADS</div>

            <div className="adtv-slot-list">
              <div>18:00 — Restaurant Promo</div>
              <div>19:00 — Event Ad</div>
              <div>20:00 — Local Business</div>
            </div>
          </div>

          {/* UPLOAD */}
          <div className="section">
            <div className="section-title">Upload / Preview</div>
            <div className="section-meta">CREATE AND TEST ADS</div>

            <button
              className="btn-primary"
              onClick={() => handleModeChange("upload")}
            >
              Upload Ad
            </button>
          </div>

        </div>

        {/* RIGHT */}
        <div className="card card-soft">

          <div className="section">
            <div className="section-title">Book Slot</div>
            <div className="section-meta">{selectedLabel}</div>
          </div>

          <CommunityPlusAdSlotDial
            slots={slots}
            onSelectSlot={handleSelectSlot}
          />

        </div>

      </div>
    </div>
  );
}