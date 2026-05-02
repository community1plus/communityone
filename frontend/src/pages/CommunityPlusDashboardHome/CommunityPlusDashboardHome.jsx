import { useEffect, useMemo, useCallback } from "react";
import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";
import TwoColumnLayout from "../../components/TwoColumnLayout";

/* =========================
   MOCK DATA (TEMP)
========================= */

const FEED_ITEMS = [
  {
    id: 1,
    type: "incident",
    title: "🚨 Incident reported nearby",
    location: { lat: -37.8136, lng: 144.9631 },
  },
  {
    id: 2,
    type: "event",
    title: "📅 Community event tonight",
    location: { lat: -37.81, lng: 144.97 },
  },
  {
    id: 3,
    type: "alert",
    title: "📡 Beacon alert triggered",
    location: { lat: -37.82, lng: 144.95 },
  },
  {
    id: 4,
    type: "post",
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
   FEED (MAP-DRIVEN)
========================= */

function Feed() {
  const {
    addMarkers,
    visibleMarkers,
    selectedMarkerId,
    focusOnMarker,
    clearSelection,
  } = useMap();

  const items = useMemo(() => FEED_ITEMS, []);

  /* =========================
     INGEST DATA → GLOBAL STATE
  ========================= */

  useEffect(() => {
    addMarkers(items, "feed");
  }, [items, addMarkers]);

  /* =========================
     HANDLERS
  ========================= */

  const handleClick = useCallback(
    (item) => {
      focusOnMarker(item.location, item.id);
    },
    [focusOnMarker]
  );

  const handleHover = useCallback(
    (item) => {
      focusOnMarker(item.location, item.id);
    },
    [focusOnMarker]
  );

  const handleLeave = useCallback(
    (item) => {
      if (selectedMarkerId !== item.id) {
        clearSelection();
      }
    },
    [selectedMarkerId, clearSelection]
  );

  /* =========================
     RENDER (USE VISIBLE MARKERS)
  ========================= */

  if (!visibleMarkers.length) {
    return <div className="feed-empty">No activity in this area</div>;
  }

  return (
    <>
      {visibleMarkers.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          isActive={selectedMarkerId === item.id}
          onClick={() => handleClick(item)}
          onHover={() => handleHover(item)}
          onLeave={() => handleLeave(item)}
        />
      ))}
    </>
  );
}

/* =========================
   HOME (MAP-FIRST)
========================= */

export default function CommunityPlusDashboardHome() {
  return (
    <div className="dashboard-home">
      <section className="dashboard-home-feed">
        <Feed />
      </section>

      <section className="dashboard-home-map">
        <CommunityMap />
      </section>
    </div>
  );
}