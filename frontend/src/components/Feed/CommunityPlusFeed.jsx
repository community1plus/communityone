import { useEffect, useMemo, useState } from "react";
import { useMap } from "../../context/MapContext";
import FeedCard from "../FeedCard/CommunityPlusFeedCard";

function formatRelativeTime(value) {
  if (!value) return "Just now";

  const diffMinutes = Math.floor(
    (Date.now() - new Date(value).getTime()) / 60000
  );

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

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/posts`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Could not load posts");
        }

        setItems(data.posts || []);
      } catch (err) {
        console.error("Load posts failed:", err);
        setError(err?.message || "Could not load posts");
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;

    if (activeFilter === "now") {
      return items.filter((item) =>
        ["now", "incident", "event", "beacon"].includes(item.type)
      );
    }

    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  useEffect(() => {
    const markerItems = filteredItems
      .filter((item) => item.location)
      .map((item) => ({
        ...item,
        __source: "feed",
      }));

    setMarkers((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));

      const nextMarkers = markerItems.filter(
        (item) => !existingIds.has(item.id)
      );

      return [...prev, ...nextMarkers];
    });
  }, [filteredItems, setMarkers]);

  if (loading) {
    return <div className="feed-empty">Loading posts...</div>;
  }

  if (error) {
    return <div className="feed-empty">{error}</div>;
  }

  if (!filteredItems.length) {
    return <div className="feed-empty">No posts yet.</div>;
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