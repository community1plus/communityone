import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusAdTv.css";

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
    }, 15000);

    return () => clearInterval(interval);
  }, [ads]);

  const currentAd = ads[currentIndex];

  /* =========================
     CONTEXT VISIBILITY
  ========================= */

  useEffect(() => {
    setVisible(context !== "composer");
  }, [context]);

  if (!visible || !currentAd) return null;

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
     UI
  ========================= */

  return (
    <div
      className={`
        theme-adtv 
        adtv-container 
        panel 
        ${expanded ? "adtv-expanded" : ""}
      `}
    >

      {/* BRAND */}
      <div className="adtv-brand">
        AD.TV <span className="adtv-sp">SP</span>
      </div>

      {/* VIDEO */}
      <div className="adtv-video-wrapper">
        <video
          ref={videoRef}
          src={currentAd.url}
          autoPlay
          muted
          loop
          playsInline
          className="adtv-video"
        />
      </div>

      {/* CONTROLS */}
      <div className="adtv-controls">

        <button className="btn btn-ghost" onClick={togglePlay}>
          ⏯
        </button>

        <button
          className="btn btn-ghost"
          onClick={() =>
            setCurrentIndex((prev) => (prev + 1) % ads.length)
          }
        >
          →
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => setExpanded(!expanded)}
        >
          ⤢
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => setVisible(false)}
        >
          ×
        </button>

      </div>

    </div>
  );
}