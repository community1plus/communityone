import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./CommunityPlusAdTv.css";

export default function CommunityPlusAdTv({
  ads = [],
  context = "feed",
  mode = "floating",      // 🔥 NEW (floating | page)
  tvMode = "live",        // 🔥 NEW (live | schedule | upload | idle)
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const videoRef = useRef();
  const location = useLocation();

  /* =========================
     HIDE FLOATING ON /adtv
  ========================= */
  if (location.pathname === "/adtv" && mode !== "page") return null;

  /* =========================
     ROTATION
  ========================= */
  useEffect(() => {
    if (!ads.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [ads]);

  const currentAd = ads[currentIndex];

  /* =========================
     VISIBILITY
  ========================= */
  useEffect(() => {
    setVisible(context !== "composer");
  }, [context]);

  if (!visible) return null;

  /* =========================
     CONTROLS
  ========================= */
  const togglePlay = () => {
    if (!videoRef.current) return;
    videoRef.current.paused
      ? videoRef.current.play()
      : videoRef.current.pause();
  };

  /* =========================
     TV CONTENT SWITCHER
  ========================= */

  const renderContent = () => {
    // 🔥 PRIORITY: live ad
    if (tvMode === "live" && currentAd) {
      return (
        <video
          ref={videoRef}
          src={currentAd.url}
          autoPlay
          muted
          loop
          playsInline
          className="adtv-video"
        />
      );
    }

    // 🔥 NO ADS → IDLE
    if (!currentAd || tvMode === "idle") {
      return (
        <div className="adtv-empty">
          <div className="adtv-logo">
            AD.TV <span className="adtv-sp">SP</span>
          </div>

          <div className="adtv-echo">🐦</div>

          <div className="meta">
            Searching for ads near you
          </div>
        </div>
      );
    }

    // 🔥 SCHEDULE VIEW
    if (tvMode === "schedule") {
      return (
        <div className="adtv-panel">
          <div className="h3">Upcoming</div>
          <div className="meta">Ad schedule</div>

          <div className="adtv-slot-list">
            <div>18:00 — Restaurant</div>
            <div>19:00 — Event</div>
            <div>20:00 — Local Business</div>
          </div>
        </div>
      );
    }

    // 🔥 UPLOAD VIEW
    if (tvMode === "upload") {
      return (
        <div className="adtv-panel">
          <div className="h3">Upload Ad</div>
          <div className="meta">Create and preview</div>

          <button className="btn btn-primary">
            Upload
          </button>
        </div>
      );
    }

    return null;
  };

  /* =========================
     UI
  ========================= */
  return (
    <div
      className={`adtv-tv-shell ${
        mode === "page" ? "adtv-embedded" : ""
      }`}
    >

      {/* SCREEN */}
      <div className="adtv-screen">
        {renderContent()}
      </div>

      {/* CONTROLS */}
      <div className="adtv-controls-bar">

        <button onClick={() => setVisible(false)}>×</button>

        {mode !== "page" && (
          <>
            <button onClick={togglePlay}>⏯</button>

            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % ads.length)
              }
            >
              →
            </button>
          </>
        )}

      </div>

    </div>
  );
}