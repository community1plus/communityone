import React from "react";
import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";
//import AdSlotDial from "../components/AdSlotDial";

export default function CommunityPlusAdTvPage() {
  const mockSlots = Array.from({ length: 24 }).map(() => ({
    count: Math.floor(Math.random() * 5),
    capacity: 5,
  }));

  return (
    <div className="adtv-page">

      {/* HERO */}
      <div className="adtv-hero panel">

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

        {/* 🔥 REAL PLAYER */}
        <div className="adtv-player">
          <CommunityPlusAdTv mode="page" context="page" />
        </div>

      </div>

      {/* NOW PLAYING */}
      <div className="adtv-section">
        <h2 className="h2">Now Playing</h2>
        <div className="meta">CURRENT AD STREAM</div>

        <div className="adtv-mini-preview">
          Active campaign preview
        </div>
      </div>

      {/* 🔥 NEW: SLOT DIAL */}
      {/**
      <div className="adtv-section">
        <h2 className="h2">Book a Slot</h2>
        <div className="meta">SELECT AN HOUR</div>

        <AdSlotDial
          slots={mockSlots}
          onSelectSlot={(hour) => {
            console.log("Selected hour:", hour);
          }}
        />
      </div>
      **/}

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

        <button className="btn btn-primary">
          Upload Ad
        </button>
      </div>

    </div>
  );
}