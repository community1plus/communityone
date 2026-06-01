import { useCallback, useEffect, useMemo, useState } from "react";
import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";
import FeedCard from "../../components/FeedCard/CommunityPlusFeedCard";



const DEFAULT_FEED_CARD = {
  id: "default-feed-card",
  type: "welcome",
  title: "👋 Welcome to Community One",
  content:
    "No community activity has been posted yet. Be the first to share news, events, alerts or updates with your local area.",
  author: "Community One",
  created_at: new Date().toISOString(),
  expires_at: null,
  system: true,
  location: null,
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "now", label: "Now" },
  { id: "blob", label: "Blobs" },
  { id: "incident", label: "Incidents" },
  { id: "event", label: "Events" },
  { id: "beacon", label: "Beacons" },
];

function isCurrentActivity(item) {
  if (!item?.expires_at) return true;
  return new Date(item.expires_at).getTime() > Date.now();
}

function sortByMostRecent(items = []) {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  );
}

function applyFeedFilter(items = [], activeFilter = "all") {
  if (activeFilter === "all") return items;

  if (activeFilter === "now") {
    return items.filter((item) =>
      ["now", "incident", "event", "beacon"].includes(item.type)
    );
  }

  return items.filter((item) => item.type === activeFilter);
}

function resolveDashboardFeed(items = []) {
  if (!items.length) {
    return {
      mode: "empty",
      items: [DEFAULT_FEED_CARD],
    };
  }

  const currentItems = items.filter(isCurrentActivity);

  if (currentItems.length) {
    return {
      mode: "active",
      items: sortByMostRecent(currentItems),
    };
  }

  const latestItem = sortByMostRecent(items)[0];

  return {
    mode: "fallback",
    items: latestItem ? [latestItem] : [DEFAULT_FEED_CARD],
  };
}

function formatRelativeTime(value) {
  if (!value) return "Just now";

  const now = Date.now();
  const then = new Date(value).getTime();

  if (Number.isNaN(then)) return "Just now";

  const diffMinutes = Math.floor((now - then) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays}d ago`;
}

function Feed({ activeFilter }) {
  const {
    addMarkers,
    visibleMarkers,
    selectedMarkerId,
    focusOnMarker,
    clearSelection,
  } = useMap();

  const resolvedFeed = useMemo(() => {
const filteredItems = applyFeedFilter(items, activeFilter);
    return resolveDashboardFeed(filteredItems);
  }, [activeFilter]);

  const feedItems = resolvedFeed.items;

  useEffect(() => {
    const markerItems = feedItems.filter(
      (item) => item.location && !item.system
    );

    addMarkers(markerItems, "feed");
  }, [feedItems, addMarkers]);

  const itemsToRender = useMemo(() => {
    if (resolvedFeed.mode === "empty") return feedItems;
    if (!visibleMarkers.length) return feedItems;

    return feedItems.filter((item) =>
      visibleMarkers.some((marker) => marker.id === item.id)
    );
  }, [visibleMarkers, feedItems, resolvedFeed.mode]);

  const handleSelect = useCallback(
    ({ id, location }) => {
      if (!location) return;
      focusOnMarker(location, id);
    },
    [focusOnMarker]
  );

  const handleMouseLeave = useCallback(
    (item) => {
      if (item.system) return;
      if (selectedMarkerId !== item.id) clearSelection();
    },
    [selectedMarkerId, clearSelection]
  );

  if (!itemsToRender.length) {
    return (
      <FeedCard
  id={item.id}
  type={item.type}
  name={item.author || item.user_id || "Community Member"}
  time={formatRelativeTime(item.created_at)}
  text={item.content || item.title}
  image={item.media?.[0]?.signedUrl || item.image || null}
  media={item.media || []}
  location={item.location}
  active={selectedMarkerId === item.id}
  onSelect={handleSelect}
/>
    );
  }

  return (
    <>
      {resolvedFeed.mode === "fallback" && (
        <div className="feed-empty">
          No current activity. Showing the most recent update.
        </div>
      )}

      {itemsToRender.map((item) => (
        <div key={item.id} onMouseLeave={() => handleMouseLeave(item)}>
          <FeedCard
            id={item.id}
            type={item.type}
            name={item.author || "Community Member"}
            time={formatRelativeTime(item.created_at)}
            text={item.content || item.title}
            image={item.image || null}
            location={item.location}
            active={selectedMarkerId === item.id}
            onSelect={handleSelect}
          />
        </div>
      ))}
    </>
  );
}

export default function CommunityPlusDashboardHome() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("local");
  const [searchResults, setSearchResults] = useState([]);

  const { focusOnMarker } = useMap();

  const handleSearch = useCallback((event) => {
    const value = event.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

const results = posts.filter((item) => {
      const haystack = `${item.title} ${item.content} ${item.type}`.toLowerCase();
      return haystack.includes(value.toLowerCase());
    });

    setSearchResults(results);
  }, []);

  const handleSearchSelect = useCallback(
    (result) => {
      if (!result?.location) return;

      focusOnMarker(result.location, result.id);
      setSearchQuery(result.title || result.content || "");
      setSearchResults([]);
    },
    [focusOnMarker]
  );

  return (
    <div className="dashboard-home-page">
      <div className="dashboard-home">
        <section className="dashboard-home-feed">
          <div className="feed-filters feed-filters-left" aria-label="Feed filters">
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
          <div className="dashboard-map-toolbar">
            <div className="dashboard-search-controls">
              <div className="dashboard-search-box">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={`Search ${
                    searchMode === "local" ? "your community" : "the world"
                  }...`}
                />

                <span className="dashboard-search-icon">⌕</span>
              </div>

              <div className="dashboard-search-mode">
                <button
                  type="button"
                  className={searchMode === "local" ? "active" : ""}
                  onClick={() => setSearchMode("local")}
                >
                  Local
                </button>

                <button
                  type="button"
                  className={searchMode === "global" ? "active" : ""}
                  onClick={() => setSearchMode("global")}
                >
                  Global
                </button>
              </div>
            </div>

            {!!searchResults.length && (
              <div className="dashboard-search-results">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className="dashboard-search-result"
                    onClick={() => handleSearchSelect(result)}
                  >
                    <div className="dashboard-search-result-meta">
                      <span>{result.type}</span>
                      <strong>{result.title}</strong>
                    </div>

                    <p>{result.content}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-map-canvas">
            <CommunityMap searchQuery={searchQuery} searchMode={searchMode} />
          </div>
        </section>
      </div>
    </div>
  );
}