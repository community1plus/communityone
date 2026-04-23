import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./CommunityPlusAdTv.css";

export default function CommunityPlusAdTv({ ads = [], context = "feed" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const videoRef = useRef();
  const location = useLocation();

  /* =========================
     HIDE ON AD.TV PAGE
  ========================= */
  if (location.pathname === "/adtv") return null;

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
     UI
  ========================= */
  return (
    <div className="adtv-tv-shell">

      {/* SCREEN */}
      <div className="adtv-screen">

        {/* EMPTY STATE */}
        {!currentAd && (
          <div className="adtv-empty">

            <div className="adtv-logo">
              AD.TV <span className="adtv-sp">SP</span>
            </div>

            {/* 🔥 Echo mascot placeholder */}
            <div className="adtv-echo">
              🐦
            </div>

            <div className="meta">
              Waiting for ads in your area
            </div>

          </div>
        )}

        {/* VIDEO */}
        {currentAd && (
          <video
            ref={videoRef}
            src={currentAd.url}
            autoPlay
            muted
            loop
            playsInline
            className="adtv-video"
          />
        )}

      </div>

      {/* CONTROLS */}
      <div className="adtv-controls-bar">

        <button onClick={togglePlay}>⏯</button>

        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev + 1) % ads.length)
          }
        >
          →
        </button>

        <button onClick={() => setVisible(false)}>×</button>

      </div>
    </div>
  );
}