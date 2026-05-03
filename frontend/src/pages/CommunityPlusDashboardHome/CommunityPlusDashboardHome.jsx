import { useCallback, useEffect, useMemo, useState } from "react";
import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";

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
    type: "beacon",
    title: "📡 Beacon alert triggered",
    location: { lat: -37.82, lng: 144.95 },
  },
  {
    id: 4,
    type: "blob",
    title: "🛍️ Local business promotion",
    location: { lat: -37.815, lng: 144.98 },
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "now", label: "Now" },
  { id: "blob", label: "Blobs" },
  { id: "incident", label: "Incidents" },
  { id: "event", label: "Events" },
  { id: "beacon", label: "Beacons" },
];

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

function Feed({ activeFilter }) {
  const {
    addMarkers,
    visibleMarkers,
    selectedMarkerId,
    focusOnMarker,
    clearSelection,
  } = useMap();

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return FEED_ITEMS;

    if (activeFilter === "now") {
      return FEED_ITEMS.filter((item) =>
        ["incident", "event", "beacon"].includes(item.type)
      );
    }

    return FEED_ITEMS.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    addMarkers(filteredItems, "feed");
  }, [filteredItems, addMarkers]);

  const itemsToRender = useMemo(() => {
    if (!visibleMarkers.length) return filteredItems;

    return visibleMarkers.filter((marker) =>
      filteredItems.some((item) => item.id === marker.id)
    );
  }, [visibleMarkers, filteredItems]);

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
      if (selectedMarkerId !== item.id) clearSelection();
    },
    [selectedMarkerId, clearSelection]
  );

  if (!itemsToRender.length) {
    return <div className="feed-empty">No activity in this area</div>;
  }

  return (
    <>
      {itemsToRender.map((item) => (
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

export default function CommunityPlusDashboardHome() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="dashboard-home">
      <section className="dashboard-home-feed">
        <div className="feed-filters" aria-label="Feed filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`feed-filter ${
                activeFilter === filter.id ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="feed-list">
          <Feed activeFilter={activeFilter} />
        </div>
      </section>

      <section className="dashboard-home-map">
        <CommunityMap />
      </section>
    </div>
  );
}