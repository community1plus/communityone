import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./CommunityPlusAdTv.css";

export default function CommunityPlusAdTv({
  ads = [],
  context = "feed",
  mode = "floating", // floating | page
  tvMode = "live",   // live | schedule | upload | idle
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const videoRef = useRef(null);
  const location = useLocation();

  /* =========================
     DEBUG (SAFE)
  ========================= */
  useEffect(() => {
    console.log("AD.TV:", {
      mode,
      path: location.pathname,
      visible,
      ads,
    });
  }, [mode, location.pathname, visible, ads]);

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

    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  /* =========================
     TV CONTENT SWITCHER
  ========================= */

  const renderContent = () => {
    // 🎬 LIVE MODE
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

    // 💤 IDLE (NO ADS)
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

    // 🕒 SCHEDULE
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

    // ⬆️ UPLOAD
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
     UI (FINAL)
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

        {/* Close */}
        <button onClick={() => setVisible(false)}>×</button>

        {/* Floating controls only */}
        {mode !== "page" && (
          <>
            <button onClick={togglePlay}>⏯</button>

            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  ads.length ? (prev + 1) % ads.length : 0
                )
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