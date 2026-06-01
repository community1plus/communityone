import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";
import FeedCard from "../../components/FeedCard/CommunityPlusFeedCard";

/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "now", label: "Now" },
  { id: "blob", label: "Blobs" },
  { id: "incident", label: "Incidents" },
  { id: "event", label: "Events" },
  { id: "beacon", label: "Beacons" },
];

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
  media: [],
};

/* =========================================================
   HELPERS
========================================================= */

function formatRelativeTime(value) {
  if (!value) return "Just now";

  const then = new Date(value).getTime();

  if (Number.isNaN(then)) return "Just now";

  const diff = Math.floor((Date.now() - then) / 60000);

  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;

  return `${Math.floor(diff / 1440)}d ago`;
}

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
  if (activeFilter === "all") {
    return items;
  }

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

function getPostImage(item) {
  const firstMedia = item?.media?.[0];

  return (
    firstMedia?.signedUrl ||
    firstMedia?.publicUrl ||
    item?.image ||
    null
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function CommunityPlusDashboardHome() {
  const {
    addMarkers,
    focusOnMarker,
    visibleMarkers,
    selectedMarkerId,
    clearSelection,
  } = useMap();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("local");
  const [searchResults, setSearchResults] = useState([]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filterRailRef = useRef(null);

  /* =======================================================
     LOAD POSTS
  ======================================================= */

  const loadPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      setPostsError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/posts`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Could not load posts");
      }

      setPosts(data.posts || []);
    } catch (err) {
      console.error("Load posts failed:", err);
      setPostsError(err?.message || "Could not load posts");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  /* =======================================================
     FILTERED FEED
  ======================================================= */

  const resolvedFeed = useMemo(() => {
    const filteredItems = applyFeedFilter(posts, activeFilter);

    return resolveDashboardFeed(filteredItems);
  }, [posts, activeFilter]);

  const feedItems = resolvedFeed.items;

  const itemsToRender = useMemo(() => {
    if (resolvedFeed.mode === "empty") {
      return feedItems;
    }

    if (!visibleMarkers.length) {
      return feedItems;
    }

    return feedItems.filter((item) =>
      visibleMarkers.some((marker) => marker.id === item.id)
    );
  }, [visibleMarkers, feedItems, resolvedFeed.mode]);

  /* =======================================================
     MAP MARKERS
  ======================================================= */

  useEffect(() => {
    const markerItems = feedItems.filter(
      (item) => item.location && !item.system
    );

    addMarkers(markerItems, "feed");
  }, [feedItems, addMarkers]);

  /* =======================================================
     RAIL STATE
  ======================================================= */

  const updateRailState = useCallback(() => {
    const rail = filterRailRef.current;

    if (!rail) return;

    setCanScrollLeft(rail.scrollLeft > 4);

    setCanScrollRight(
      rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 4
    );
  }, []);

  useEffect(() => {
    updateRailState();

    const rail = filterRailRef.current;

    if (!rail) return;

    rail.addEventListener("scroll", updateRailState);

    return () => {
      rail.removeEventListener("scroll", updateRailState);
    };
  }, [updateRailState]);

  /* =======================================================
     FILTER SHIFT
  ======================================================= */

  const shiftFiltersLeft = useCallback(() => {
    filterRailRef.current?.scrollBy({
      left: -220,
      behavior: "smooth",
    });
  }, []);

  const shiftFiltersRight = useCallback(() => {
    filterRailRef.current?.scrollBy({
      left: 220,
      behavior: "smooth",
    });
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = useCallback(
    (event) => {
      const value = event.target.value;

      setSearchQuery(value);

      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

      const query = value.toLowerCase();

      const results = posts.filter((item) => {
        const haystack = `
          ${item.title || ""}
          ${item.content || ""}
          ${item.type || ""}
          ${item.category || ""}
          ${item.author || ""}
        `.toLowerCase();

        return haystack.includes(query);
      });

      setSearchResults(results);
    },
    [posts]
  );

  /* =======================================================
     SEARCH SELECT
  ======================================================= */

  const handleSearchSelect = useCallback(
    (item) => {
      if (item?.location) {
        focusOnMarker(item.location, item.id);
      }

      setSearchQuery(item.title || item.content || "");
      setSearchResults([]);
    },
    [focusOnMarker]
  );

  /* =======================================================
     FEED SELECT
  ======================================================= */

  const handleFeedSelect = useCallback(
    ({ id, location }) => {
      if (!location) return;

      focusOnMarker(location, id);
    },
    [focusOnMarker]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dashboard-home-page">
      <div className="dashboard-home">
        <section className="dashboard-home-feed">
          <div className="feed-filters-wrapper">
            {canScrollLeft && (
              <button
                type="button"
                className="filter-shift left"
                onClick={shiftFiltersLeft}
              >
                ←
              </button>
            )}

            <div ref={filterRailRef} className="feed-filters">
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

            {canScrollRight && (
              <button
                type="button"
                className="filter-shift right"
                onClick={shiftFiltersRight}
              >
                →
              </button>
            )}
          </div>

          <div className="feed-list">
            {postsLoading && (
              <div className="feed-empty">Loading posts...</div>
            )}

            {!postsLoading && postsError && (
              <div className="feed-empty">{postsError}</div>
            )}

            {!postsLoading &&
              !postsError &&
              resolvedFeed.mode === "fallback" && (
                <div className="feed-empty">
                  No current activity. Showing the most recent update.
                </div>
              )}

            {!postsLoading &&
              !postsError &&
              itemsToRender.map((item) => (
                <div
                  key={item.id}
                  onMouseLeave={() => {
                    if (item.system) return;

                    if (selectedMarkerId !== item.id) {
                      clearSelection();
                    }
                  }}
                >
                  <FeedCard
                    id={item.id}
                    type={item.type}
                    name={
                      item.author ||
                      item.user_id ||
                      "Community Member"
                    }
                    text={item.content || item.title}
                    time={formatRelativeTime(item.created_at)}
                    image={getPostImage(item)}
                    media={item.media || []}
                    location={item.location}
                    active={selectedMarkerId === item.id}
                    onSelect={handleFeedSelect}
                  />
                </div>
              ))}
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

                {!!searchResults.length && (
                  <div className="dashboard-search-results">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="dashboard-search-result"
                        onClick={() => handleSearchSelect(item)}
                      >
                        <div className="dashboard-search-result-meta">
                          <span>{item.type}</span>
                          <strong>{item.title}</strong>
                        </div>

                        <p>{item.content}</p>
                      </button>
                    ))}
                  </div>
                )}
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