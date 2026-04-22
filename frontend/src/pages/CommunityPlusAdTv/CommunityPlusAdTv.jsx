import React, { useState, useEffect, useRef } from "react";
import "./AdTV.css";

export default function CommunityPlusAdTv({ ads = [], context = "feed" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  const videoRef = useRef();

  /* =========================
     PLAYLIST ROTATION
  ========================= */

  useEffect(() => {
    if (!ads.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 15000); // rotate every 15s

    return () => clearInterval(interval);
  }, [ads]);

  const currentAd = ads[currentIndex];

  /* =========================
     CONTEXT VISIBILITY
  ========================= */

  useEffect(() => {
    if (context === "composer") {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [context]);

  if (!visible || !currentAd) return null;

  /* =========================
     UI
  ========================= */

  return (
    <div className={`ad-tv ${expanded ? "expanded" : ""}`}>

      {/* BADGE */}
      <div className="ad-tv-badge">
        AD.TV <span className="sp">SP</span>
      </div>

      {/* VIDEO */}
      <video
        ref={videoRef}
        src={currentAd.url}
        autoPlay
        muted
        loop
        playsInline
        className="ad-tv-video"
      />

      {/* CONTROLS */}
      <div className="ad-tv-controls">

        <button
          onClick={() => {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }}
        >
          ⏯
        </button>

        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev + 1) % ads.length)
          }
        >
          →
        </button>

        <button onClick={() => setExpanded(!expanded)}>
          ⤢
        </button>

        <button onClick={() => setVisible(false)}>
          ×
        </button>

      </div>

    </div>
  );
}