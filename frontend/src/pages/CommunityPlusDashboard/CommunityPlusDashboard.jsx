
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./CommunityPlusDashboardHome.css";
import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";
import FeedCard from "../../components/FeedCard/CommunityPlusFeedCard";

const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "")
).replace(/\/$/, "");

const FILTERS = [
  { id: "all", label: "All" },
  { id: "now", label: "Now" },
  { id: "blob", label: "Blobs" },
  { id: "incident", label: "Incidents" },
  { id: "event", label: "Events" },
  { id: "beacon", label: "Beacons" },
];

const CURRENT_TYPES = [
  "now",
  "incident",
  "event",
  "beacon",
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

function getPostText(item) {
  return item.content || item.title || "";
}

function filterPosts(posts, activeFilter) {
  if (activeFilter === "all" || activeFilter === "blob") {
    return posts;
  }

  if (activeFilter === "now") {
    return posts.filter((item) =>
      CURRENT_TYPES.includes(
        String(item.type || "").toLowerCase()
      )
    );
  }

  return posts.filter(
    (item) =>
      String(item.type || "").toLowerCase() === activeFilter
  );
}

function matchesSearch(item, query) {
  if (!query.trim()) return true;

  const searchableText = [
    item.title,
    item.content,
    item.type,
    item.author,
    item.user_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query.trim().toLowerCase());
}

export default function CommunityPlusDashboardHome() {
  const {
    setMarkers,
    focusOnMarker,
  } = useMap();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("local");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPostId, setSelectedPostId] = useState(null);

  // The backend determines whether a post belongs to NOW or BLOB.
  const view = activeFilter === "blob" ? "blob" : "now";

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        setLoading(true);
        setError("");

        if (!API_BASE) {
          throw new Error(
            "API base URL is not configured."
          );
        }

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

        setPosts(
          Array.isArray(data.posts) ? data.posts : []
        );
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error(
          "Dashboard posts failed to load:",
          err
        );

        setPosts([]);
        setError(
          err?.message || "Could not load community posts."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => controller.abort();
  }, [view]);

  const filteredPosts = useMemo(
    () => filterPosts(posts, activeFilter),
    [posts, activeFilter]
  );

  const visiblePosts = useMemo(
    () =>
      filteredPosts.filter((item) =>
        matchesSearch(item, searchQuery)
      ),
    [filteredPosts, searchQuery]
  );

  // Keep map markers synchronised with the displayed feed.
  // Preserve markers owned by other parts of the application.
  useEffect(() => {
    const feedMarkers = visiblePosts
      .filter((item) => item.location)
      .map((item) => ({
        ...item,
        __source: "feed",
      }));

    setMarkers((previousMarkers) => [
      ...previousMarkers.filter(
        (marker) => marker.__source !== "feed"
      ),
      ...feedMarkers,
    ]);

    return () => {
      setMarkers((previousMarkers) =>
        previousMarkers.filter(
          (marker) => marker.__source !== "feed"
        )
      );
    };
  }, [visiblePosts, setMarkers]);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSelectPost = useCallback(
    (item) => {
      setSelectedPostId(item.id);

      if (item.location) {
        focusOnMarker(item.location, item.id);
      }
    },
    [focusOnMarker]
  );

  const handleSearchResultSelect = useCallback(
    (item) => {
      handleSelectPost(item);
      setSearchQuery(item.title || getPostText(item));
    },
    [handleSelectPost]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return visiblePosts.slice(0, 5);
  }, [visiblePosts, searchQuery]);

  const emptyMessage =
    activeFilter === "blob"
      ? "No expired posts to display."
      : searchQuery.trim()
        ? "No matching community posts."
        : "No current community activity.";

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
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="feed-list">
            {loading ? (
              <div className="feed-empty">
                Loading posts...
              </div>
            ) : error ? (
              <div className="feed-empty" role="alert">
                {error}
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="feed-empty">
                {emptyMessage}
              </div>
            ) : (
              <div className="feed">
                {visiblePosts.map((item) => (
                  <FeedCard
                    key={item.id}
                    id={item.id}
                    title={item.title || ""}
                    type={item.type}
                    text={getPostText(item)}
                    time={formatRelativeTime(
                      item.created_at
                    )}
                    image={
                      item.media?.[0]?.signedUrl ||
                      item.media?.[0]?.publicUrl ||
                      item.image ||
                      null
                    }
                    location={item.location}
                    active={selectedPostId === item.id}
                    onSelect={() => handleSelectPost(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-home-map">
          <div className="dashboard-map-toolbar">
            <div className="dashboard-search-controls">
              <div className="dashboard-search-box">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={
                    searchMode === "local"
                      ? "Search your Community ..."
                      : "Search the World ..."
                  }
                  aria-label="Search community posts"
                />

                <span
                  className="dashboard-search-icon"
                  aria-hidden="true"
                >
                  ⌕
                </span>
              </div>

              <div
                className="dashboard-search-mode"
                aria-label="Search scope"
              >
                <button
                  type="button"
                  className={
                    searchMode === "local" ? "active" : ""
                  }
                  aria-pressed={searchMode === "local"}
                  onClick={() => setSearchMode("local")}
                >
                  Local
                </button>

                <button
                  type="button"
                  className={
                    searchMode === "global" ? "active" : ""
                  }
                  aria-pressed={searchMode === "global"}
                  onClick={() => setSearchMode("global")}
                >
                  Global
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="dashboard-search-results">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="dashboard-search-result"
                    onClick={() =>
                      handleSearchResultSelect(item)
                    }
                  >
                    <div className="dashboard-search-result-meta">
                      <span>{item.type || "Post"}</span>
                      <strong>
                        {item.title || getPostText(item)}
                      </strong>
                    </div>

                    {item.title && item.content && (
                      <p>{item.content}</p>
                    )}
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
