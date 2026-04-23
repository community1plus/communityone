import React from "react";

export default function CommunityPlusAdTvPage() {
  return (
    <div className="theme-adtv adtv-page">

      {/* =========================
         HERO (LIVE CHANNEL)
      ========================= */}
      <div className="adtv-hero panel">

        <div className="adtv-hero-header">
          <div className="adtv-title">
            <h1 className="h1">
              AD.TV <span className="adtv-sp">SP</span>
            </h1>
            <div className="meta">
              Live ad channel • location-aware • time-based
            </div>
          </div>

          <div className="adtv-live-indicator">
            ● LIVE
          </div>
        </div>

        {/* 🔥 MAIN PLAYER */}
        <div className="adtv-player">
          <div className="adtv-placeholder">
            ▶ Live Ad Stream
          </div>
        </div>

      </div>

      {/* =========================
         CONTENT GRID
      ========================= */}
      <div className="adtv-grid">

        {/* NOW PLAYING */}
        <div className="panel adtv-card">
          <h2 className="h2">Now Playing</h2>
          <p className="meta">Current ad stream</p>

          <div className="adtv-mini-preview">
            Active campaign preview
          </div>
        </div>

        {/* UPCOMING SLOTS */}
        <div className="panel adtv-card">
          <h2 className="h2">Upcoming Slots</h2>
          <p className="meta">Scheduled ads</p>

          <div className="adtv-slot-list">
            <div>18:00 — Restaurant Promo</div>
            <div>19:00 — Event Ad</div>
            <div>20:00 — Local Business</div>
          </div>
        </div>

        {/* UPLOAD / PREVIEW */}
        <div className="panel adtv-card">
          <h2 className="h2">Upload / Preview</h2>
          <p className="meta">Create and test ads</p>

          <button className="btn btn-primary">
            Upload Ad
          </button>
        </div>

      </div>

    </div>
  );
}