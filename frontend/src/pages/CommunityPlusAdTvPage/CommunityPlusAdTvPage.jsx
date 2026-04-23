import React, { useState, useMemo, useCallback } from "react";
import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";
import CommunityPlusAdSlotDial from "../CommunityPlusAdSlotDial/CommunityPlusAdSlotDial";

export default function CommunityPlusAdTvPage() {
  const [tvMode, setTvMode] = useState("live");
  const [selectedSlot, setSelectedSlot] = useState(null);

  /* =========================
     STABLE SLOT DATA
  ========================= */
  const slots = useMemo(() => {
    return Array.from({ length: 24 }).map(() => ({
      count: Math.floor(Math.random() * 5),
      capacity: 5,
    }));
  }, []);

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
     RENDER
  ========================= */
  return (
    <div className="adtv-page">

      {/* 🔥 CRITICAL: ALIGN WITH PROFILE */}
      <div className="page-container">

        {/* =========================
           HERO
        ========================= */}
        <header className="adtv-hero">
          <div className="adtv-hero-header">
            <h1 className="h1">
              AD.TV <span className="adtv-sp">SP</span>
            </h1>

            <div className="adtv-live">● LIVE</div>
          </div>

          <div className="meta">
            LIVE AD CHANNEL • LOCATION-AWARE • TIME-BASED
          </div>
        </header>

        {/* =========================
           STAGE (TV + DIAL)
        ========================= */}
        <section className="adtv-stage-wrapper">
          <div className="adtv-stage-layout">

            {/* TV */}
            <div className="adtv-stage">
              <CommunityPlusAdTv
                mode="page"
                context="page"
                tvMode={tvMode}
                selectedSlot={selectedSlot}
              />
            </div>

            {/* CONTROL PANEL */}
            <aside className="adtv-dial-panel">
              <div className="h3">Book Slot</div>

              <div className="meta">
                {selectedSlot !== null
                  ? `Selected: ${selectedSlot}:00`
                  : "Select an hour"}
              </div>

              <CommunityPlusAdSlotDial
                slots={slots}
                onSelectSlot={handleSelectSlot}
              />
            </aside>

          </div>
        </section>

        {/* =========================
           MODE CONTROLS
        ========================= */}
        <section className="adtv-mode-bar">
          {["live", "schedule", "upload"].map((mode) => (
            <button
              key={mode}
              className={`btn btn-ghost ${tvMode === mode ? "active" : ""}`}
              onClick={() => handleModeChange(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </section>

        {/* =========================
           SUPPORTING CONTENT
        ========================= */}
        <section className="adtv-section">
          <h2 className="h2">Now Playing</h2>
          <div className="meta">CURRENT AD STREAM</div>

          <div className="adtv-mini-preview">
            {selectedSlot !== null
              ? `Preview for ${selectedSlot}:00 slot`
              : "Active campaign preview"}
          </div>
        </section>

        <section className="adtv-section">
          <h2 className="h2">Upcoming Slots</h2>
          <div className="meta">SCHEDULED ADS</div>

          <div className="adtv-slot-list">
            <div>18:00 — Restaurant Promo</div>
            <div>19:00 — Event Ad</div>
            <div>20:00 — Local Business</div>
          </div>
        </section>

        <section className="adtv-section">
          <h2 className="h2">Upload / Preview</h2>
          <div className="meta">CREATE AND TEST ADS</div>

          <button
            className="btn btn-primary"
            onClick={() => handleModeChange("upload")}
          >
            Upload Ad
          </button>
        </section>

      </div>
    </div>
  );
}