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
  // Blobs is a lifecycle view, not a post type.
  if (["all", "now", "blob"].includes(activeFilter)) return items;

  // Category filters show posts of that category; expiry is handled below.
  return items.filter((item) => item.type === activeFilter);
}

function resolveDashboardFeed(items = [], activeFilter = "all") {
  const currentItems = items.filter(isCurrentActivity);
  const expiredItems = items.filter(
    (item) => Boolean(item.expires_at) && !isCurrentActivity(item)
  );

  if (activeFilter === "blob") {
    return {
      items: sortByMostRecent(expiredItems),
      mode: expiredItems.length ? "blob" : "empty",
    };
  }

  if (activeFilter === "now") {
    return {
      items: sortByMostRecent(currentItems),
      mode: currentItems.length ? "current" : "empty",
    };
  }

  if (["incident", "event", "beacon"].includes(activeFilter)) {
    const matchingCurrentItems = currentItems.filter(
      (item) => item.type === activeFilter
    );
    return {
      items: sortByMostRecent(matchingCurrentItems),
      mode: matchingCurrentItems.length ? "current" : "empty",
    };
  }

  // All is inclusive. Expired posts are rendered as Blobs, never as NOW.
  return {
    items: sortByMostRecent(items),
    mode: items.length ? "all" : "empty",
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

      const apiBase =
        import.meta.env.VITE_API_BASE ||
        `${import.meta.env.VITE_API_URL || ""}/api`;

      // Ask the API for lifecycle-filtered results when a view requires it.
      const view =
        activeFilter === "now" ||
        ["incident", "event", "beacon"].includes(activeFilter)
          ? "now"
          : activeFilter === "blob"
            ? "blob"
            : null;

      const baseUrl = `${apiBase.replace(/\/$/, "")}/posts`;
      const url = new URL(baseUrl, window.location.origin);
      if (view) url.searchParams.set("view", view);

      const response = await fetch(url.toString());

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
  }, [activeFilter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  /* =======================================================
     FILTERED FEED
  ======================================================= */

  const resolvedFeed = useMemo(() => {
    const filteredItems = applyFeedFilter(posts, activeFilter);
    return resolveDashboardFeed(filteredItems, activeFilter);
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
              resolvedFeed.mode === "empty" && (
                <div className="feed-empty">
                  {activeFilter === "blob"
                    ? "No expired posts to show."
                    : activeFilter === "now"
                      ? "No current activity yet. Be the first to post an update."
                      : activeFilter === "all"
                        ? "No community posts yet. Be the first to share an update."
                        : `No current ${FILTERS.find((filter) => filter.id === activeFilter)?.label.toLowerCase() || "activity"} to show.`}
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
                    type={
                      item.expires_at && !isCurrentActivity(item)
                        ? "blob"
                        : item.type
                    }
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