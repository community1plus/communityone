
import { useCallback, useEffect, useMemo, useState } from "react";
import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";
import FeedCard from "../../components/FeedCard/CommunityPlusFeedCard";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "");

const FILTERS = [
  { id: "all", label: "All" },
  { id: "now", label: "Now" },
  { id: "blob", label: "Blobs" },
  { id: "incident", label: "Incidents" },
  { id: "event", label: "Events" },
  { id: "beacon", label: "Beacons" },
];

function formatRelativeTime(value) {
  if (!value) return "Just now";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Just now";

  const diffMinutes = Math.floor(
    (Date.now() - timestamp) / 60000
  );

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
}

function filterFeedItems(items, activeFilter) {
  if (activeFilter === "all" || activeFilter === "blob") {
    return items;
  }

  if (activeFilter === "now") {
    return items.filter((item) =>
      ["now", "incident", "event", "beacon"].includes(
        String(item.type || "").toLowerCase()
      )
    );
  }

  return items.filter(
    (item) =>
      String(item.type || "").toLowerCase() ===
      activeFilter.toLowerCase()
  );
}

function Feed({ activeFilter, onItemsLoaded }) {
  const {
    addMarkers,
    visibleMarkers,
    selectedMarkerId,
    focusOnMarker,
    clearSelection,
  } = useMap();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // All/current categories use NOW.
  // Blobs uses expired posts.
  const view = activeFilter === "blob" ? "blob" : "now";

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      if (!API_BASE) {
        setItems([]);
        onItemsLoaded([]);
        setError("Backend API is not configured.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({ view });

        const response = await fetch(
          `${API_BASE}/posts?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.error || "Could not load posts."
          );
        }

        const nextItems = Array.isArray(data.posts)
          ? data.posts
          : [];

        setItems(nextItems);
        onItemsLoaded(nextItems);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Dashboard feed fetch failed:", err);
        setItems([]);
        onItemsLoaded([]);
        setError(err?.message || "Could not load posts.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => controller.abort();
  }, [view, onItemsLoaded]);

  const feedItems = useMemo(
    () => filterFeedItems(items, activeFilter),
    [items, activeFilter]
  );

  useEffect(() => {
    addMarkers(
      feedItems.filter((item) => item.location),
      "feed"
    );
  }, [feedItems, addMarkers]);

  const itemsToRender = useMemo(() => {
    if (!visibleMarkers.length) return feedItems;

    return feedItems.filter((item) =>
      visibleMarkers.some((marker) => marker.id === item.id)
    );
  }, [visibleMarkers, feedItems]);

  const handleSelect = useCallback(
    ({ id, location }) => {
      if (location) {
        focusOnMarker(location, id);
      }
    },
    [focusOnMarker]
  );

  const handleMouseLeave = useCallback(
    (item) => {
      if (selectedMarkerId !== item.id) {
        clearSelection();
      }
    },
    [selectedMarkerId, clearSelection]
  );

  if (loading) {
    return <div className="feed-empty">Loading posts...</div>;
  }

  if (error) {
    return <div className="feed-empty">{error}</div>;
  }

  if (!itemsToRender.length) {
    return (
      <div className="feed-empty">
        {activeFilter === "blob"
          ? "No expired posts to display."
          : "No current community activity."}
      </div>
    );
  }

  return (
    <>
      {itemsToRender.map((item) => (
        <div
          key={item.id}
          onMouseLeave={() => handleMouseLeave(item)}
        >
          <FeedCard
            id={item.id}
            type={item.type}
            title={item.title || ""}
            text={item.content || item.title || ""}
            time={formatRelativeTime(item.created_at)}
            image={
              item.media?.[0]?.signedUrl ||
              item.media?.[0]?.publicUrl ||
              item.image ||
              null
            }
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
  const [loadedPosts, setLoadedPosts] = useState([]);

  const { focusOnMarker } = useMap();

  const handleItemsLoaded = useCallback((items) => {
    setLoadedPosts(items);
  }, []);

  const handleSearch = useCallback(
    (event) => {
      const value = event.target.value;
      setSearchQuery(value);

      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

      const query = value.toLowerCase();

      const results = loadedPosts.filter((item) => {
        const haystack = [
          item.title,
          item.content,
          item.type,
          item.author,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });

      setSearchResults(results);
    },
    [loadedPosts]
  );

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
          <div
            className="feed-filters feed-filters-left"
            aria-label="Feed filters"
          >
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
            <Feed
              activeFilter={activeFilter}
              onItemsLoaded={handleItemsLoaded}
            />
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
                    searchMode === "local"
                      ? "your community"
                      : "the world"
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
                      <strong>
                        {result.title || result.content}
                      </strong>
                    </div>

                    <p>{result.content}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-map-canvas">
            <CommunityMap
              searchQuery={searchQuery}
              searchMode={searchMode}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
