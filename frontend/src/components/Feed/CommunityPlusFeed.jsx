
import { useEffect, useMemo, useState } from "react";
import { useMap } from "../../context/MapContext";
import FeedCard from "../FeedCard/CommunityPlusFeedCard";

function formatRelativeTime(value) {
  if (!value) return "Just now";

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return "Just now";

  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function Feed({ activeFilter = "all" }) {
  const { setMarkers, focusOnMarker } = useMap();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "all" and "now" both display the current NOW feed.
  // "blob" displays expired posts.
  const view = activeFilter === "blob" ? "blob" : "now";

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        setLoading(true);
        setError("");

        const apiBase = import.meta.env.VITE_API_BASE;

        if (!apiBase) {
          throw new Error("API base URL is not configured.");
        }

        const params = new URLSearchParams({ view });

        const response = await fetch(
          `${apiBase}/posts?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Could not load posts.");
        }

        setItems(Array.isArray(data.posts) ? data.posts : []);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Load posts failed:", err);
        setError(err?.message || "Could not load posts.");
        setItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => controller.abort();
  }, [view]);

  const filteredItems = useMemo(() => {
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
        String(activeFilter).toLowerCase()
    );
  }, [items, activeFilter]);

  useEffect(() => {
    const markerItems = filteredItems
      .filter((item) => item.location)
      .map((item) => ({
        ...item,
        __source: "feed",
      }));

    setMarkers((prev) => {
      // Replace markers previously supplied by this feed,
      // while preserving markers from other sources.
      const otherMarkers = prev.filter(
        (marker) => marker.__source !== "feed"
      );

      return [
        ...otherMarkers,
        ...markerItems,
      ];
    });
  }, [filteredItems, setMarkers]);

  if (loading) {
    return <div className="feed-empty">Loading posts...</div>;
  }

  if (error) {
    return <div className="feed-empty">{error}</div>;
  }

  if (!filteredItems.length) {
    return (
      <div className="feed-empty">
        {activeFilter === "blob"
          ? "No expired posts to display."
          : "No posts yet."}
      </div>
    );
  }

  return (
    <div className="feed">
      {filteredItems.map((item) => (
        <FeedCard
          key={item.id}
          id={item.id}
          type={item.type}
          name={item.author || item.user_id || "Community Member"}
          time={formatRelativeTime(item.created_at)}
          text={item.content || item.title}
          image={item.media?.[0]?.signedUrl || null}
          media={item.media || []}
          location={item.location}
          onSelect={() => {
            if (item.location) {
              focusOnMarker(item.location, item.id);
            }
          }}
        />
      ))}
    </div>
  );
}
