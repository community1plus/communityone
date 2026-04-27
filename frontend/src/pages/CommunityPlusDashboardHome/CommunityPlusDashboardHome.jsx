import React, { useEffect, useMemo, useCallback } from "react";
import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";
import TwoColumnLayout from "../../components/UI/TwoColumnLayout";

/* =========================
   MOCK DATA (MOVE TO API)
========================= */

const FEED_ITEMS = [
  {
    id: 1,
    type: "incident",
    isLocal: true,
    title: "🚨 Incident reported nearby",
    location: { lat: -37.8136, lng: 144.9631 },
  },
  {
    id: 2,
    type: "event",
    isLocal: true,
    title: "📅 Community event tonight",
    location: { lat: -37.81, lng: 144.97 },
  },
  {
    id: 3,
    type: "alert",
    isLocal: true,
    title: "📡 Beacon alert triggered",
    location: { lat: -37.82, lng: 144.95 },
  },
  {
    id: 4,
    type: "post",
    isLocal: true,
    title: "🛍️ Local business promotion",
    location: { lat: -37.815, lng: 144.98 },
  },
];

/* =========================
   FEED ITEM
========================= */

function FeedItem({ item, isActive, onClick, onHover, onLeave }) {
  return (
    <div
      className={`feed-card ${isActive ? "active" : ""}`}
      data-type={item.type}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {item.title}
    </div>
  );
}

/* =========================
   FEED
========================= */

function Feed() {
  const {
    focusLocation,
    setMapMarkers,
    selectedMarkerId,
  } = useMap();

  const items = useMemo(() => FEED_ITEMS, []);

  /* =========================
     SYNC MARKERS → MAP
  ========================= */

  useEffect(() => {
    setMapMarkers(items, "feed"); // 🔥 source-aware
  }, [items, setMapMarkers]);

  /* =========================
     HANDLERS (ID-BASED)
  ========================= */

  const handleClick = useCallback(
    (item) => {
      focusLocation(item.location, item.id); // 🔥 CRITICAL
    },
    [focusLocation]
  );

  const handleHover = useCallback(
    (item) => {
      focusLocation(item.location);
    },
    [focusLocation]
  );

  const handleLeave = useCallback(
    (item) => {
      if (selectedMarkerId !== item.id) {
        focusLocation(null);
      }
    },
    [selectedMarkerId, focusLocation]
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      {items.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          isActive={selectedMarkerId === item.id} // 🔥 single source of truth
          onClick={() => handleClick(item)}
          onHover={() => handleHover(item)}
          onLeave={() => handleLeave(item)}
        />
      ))}
    </>
  );
}

/* =========================
   HOME
========================= */

export default function CommunityPlusDashboardHome() {
  return (
    <TwoColumnLayout
      mode="map"
      left={<Feed />}
      right={<CommunityMap />}
    />
  );
}