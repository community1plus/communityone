import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";

/* =========================
   MOCK DATA (MOVE TO API LATER)
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
  const { focusLocation, setMapMarkers } = useMap();
  const [activeId, setActiveId] = useState(null);

  const items = useMemo(() => FEED_ITEMS, []);

  /* Sync markers to map */
  useEffect(() => {
    setMapMarkers(items);
  }, [items, setMapMarkers]);

  /* Handlers */
  const handleClick = useCallback(
    (item) => {
      setActiveId(item.id);
      focusLocation(item.location);
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
      if (activeId !== item.id) {
        focusLocation(null);
      }
    },
    [activeId, focusLocation]
  );

  return (
    <>
      {items.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          isActive={activeId === item.id}
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

export default function Home() {
  return (
    <div className="home-layout">
      {/* LEFT: FEED */}
      <div className="home-feed">
        <Feed />
      </div>

      {/* RIGHT: MAP */}
      <div className="home-map">
        <CommunityMap />
      </div>
    </div>
  );
}