import React, { useEffect, useState } from "react";
import "./CommunityPlusHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";

/* =========================
   FEED (NOW CONNECTED)
========================= */

function Feed() {
  const { focusLocation, setMapMarkers } = useMap();
  const [activeId, setActiveId] = useState(null);

  const items = [
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

  /* 🔥 send markers to map */
  useEffect(() => {
    setMapMarkers(items);
  }, [items, setMapMarkers]);

  return (
    <>
      {items.map((item) => {
        const active = activeId === item.id;

        return (
          <div
            key={item.id}
            className={`feed-card ${active ? "active" : ""}`}
            onClick={() => {
              setActiveId(item.id);
              focusLocation(item.location);
            }}
            onMouseEnter={() => focusLocation(item.location)} // 🔥 preview
          >
            {item.title}
          </div>
        );
      })}
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