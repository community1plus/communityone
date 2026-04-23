import React, { useState, useMemo } from "react";
import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";
import CommunityPlusAdSlotDial from "../CommunityPlusAdSlotDial/CommunityPlusAdSlotDial";

export default function CommunityPlusAdTvPage() {
  const [tvMode, setTvMode] = useState("live");
  const [selectedSlot, setSelectedSlot] = useState(null);

  /* =========================
     STABLE SLOT DATA (IMPORTANT)
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
  const handleSelectSlot = (hour) => {
    setSelectedSlot(hour);
    setTvMode("schedule"); // 🔥 reflect selection in TV
  };

  return (
    <div className="adtv-page page-container">

      {/* =========================
         HERO / CHANNEL HEADER
      ========================= */}
      <div className="adtv-hero">

        <div className="adtv-hero-header">
          <h1 className="h1">
            AD.TV <span className="adtv-sp">SP</span>
          </h1>

          <div className="adtv-live">
            ● LIVE
          </div>
        </div>

        <div className="meta">
          LIVE AD CHANNEL • LOCATION-AWARE • TIME-BASED
        </div>

      </div>

      {/* =========================
         TV + CONTROL SYSTEM
      ========================= */}
      <div className="adtv-stage-wrapper">

        <div className="adtv-stage-layout">

          {/* LEFT: TV */}
          <div className="adtv-stage">
            <CommunityPlusAdTv
              mode="page"
              context="page"
              tvMode={tvMode}
              selectedSlot={selectedSlot} // 🔥 NEW
            />
          </div>

          {/* RIGHT: SLOT DIAL */}
          <div className="adtv-dial-panel">
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
          </div>

        </div>

      </div>

      {/* =========================
         MODE CONTROLS
      ========================= */}
      <div className="adtv-mode-bar">

        <button
          className={`btn btn-ghost ${tvMode === "live" ? "active" : ""}`}
          onClick={() => setTvMode("live")}
        >
          Live
        </button>

        <button
          className={`btn btn-ghost ${tvMode === "schedule" ? "active" : ""}`}
          onClick={() => setTvMode("schedule")}
        >
          Schedule
        </button>

        <button
          className={`btn btn-ghost ${tvMode === "upload" ? "active" : ""}`}
          onClick={() => setTvMode("upload")}
        >
          Upload
        </button>

      </div>

      {/* =========================
         SUPPORTING CONTENT
      ========================= */}

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
          onClick={() => setTvMode("upload")}
        >
          Upload Ad
        </button>
      </div>

    </div>
  );
}