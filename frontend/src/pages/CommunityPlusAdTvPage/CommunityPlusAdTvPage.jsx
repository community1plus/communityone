import React from "react";

export default function CommunityPlusAdTvPage() {
  return (
    <div className="adtv-page">

      {/* =========================
         HERO (FULL WIDTH)
      ========================= */}
      <div className="adtv-hero">

        <div className="adtv-hero-content">

          <div className="adtv-hero-header">
            <h1 className="h1 adtv-heading">
              AD.TV <span className="adtv-sp">SP</span>
            </h1>

            <div className="adtv-live">
              ● LIVE
            </div>
          </div>

          <div className="meta adtv-meta">
            LIVE AD CHANNEL • LOCATION-AWARE • TIME-BASED
          </div>

          {/* PLAYER */}
          <div className="adtv-player">
            <div className="adtv-placeholder">
              ▶ Live Ad Stream
            </div>
          </div>

        </div>
      </div>

      {/* =========================
         GRID (FULL WIDTH)
      ========================= */}
      <div className="adtv-content">

        <div className="adtv-grid">

          {/* NOW PLAYING */}
          <div className="panel adtv-card">
            <h2 className="h2">Now Playing</h2>
            <p className="meta">Current ad stream</p>

            <div className="adtv-mini-preview">
              Active campaign preview
            </div>
          </div>

          {/* UPCOMING */}
          <div className="panel adtv-card">
            <h2 className="h2">Upcoming Slots</h2>
            <p className="meta">Scheduled ads</p>

            <div className="adtv-slot-list">
              <div>18:00 — Restaurant Promo</div>
              <div>19:00 — Event Ad</div>
              <div>20:00 — Local Business</div>
            </div>
          </div>

          {/* UPLOAD */}
          <div className="panel adtv-card">
            <h2 className="h2">Upload / Preview</h2>
            <p className="meta">Create and test ads</p>

            <button className="btn btn-primary">
              Upload Ad
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}