import { useEffect, useMemo, useState } from "react";
import "./CommunityPlusIViewPage.css";

import CommunityPlusAdTv from "../../components/CommunityPlusAdTv/CommunityPlusAdTv";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "");

function getMediaUrl(post) {
  const firstMedia = post.media?.[0];

  return (
    firstMedia?.signedUrl ||
    firstMedia?.publicUrl ||
    firstMedia?.thumbnailUrl ||
    null
  );
}

function getMediaType(post) {
  return post.media?.[0]?.mediaType || "text";
}

function formatViews(value = 0) {
  return Number(value || 0).toLocaleString();
}

function IViewCard({ item }) {
  const mediaUrl = getMediaUrl(item);
  const mediaType = getMediaType(item);

  return (
    <div className="iview-card">
      <div className="iview-media">
        {mediaUrl && mediaType === "image" && (
          <img src={mediaUrl} alt={item.title} className="iview-image" />
        )}

        {mediaUrl && mediaType === "video" && (
          <video
            src={mediaUrl}
            className="iview-image"
            muted
            playsInline
            controls
          />
        )}

        {!mediaUrl && (
          <div className="iview-empty-media">
            <span>COMMUNITY ONE</span>
          </div>
        )}
      </div>

      <div className="iview-meta">
        <div className="iview-title">{item.title}</div>

        <div className="iview-subline">
          <span>{item.uploader || item.user_id || "Community Member"}</span>
          <span>•</span>
          <span>{formatViews(item.views)} views</span>
        </div>

        <button type="button" className="iview-track">
          track
        </button>
      </div>
    </div>
  );
}

export default function CommunityPlusIViewPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/posts?limit=5`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Could not fetch posts.");
        }

        if (!cancelled) {
          setPosts(Array.isArray(data.posts) ? data.posts : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Could not load iVIEW feed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  const feedItems = useMemo(() => posts.slice(0, 5), [posts]);

  return (
    <div className="iview-page">
      {loading && <div className="iview-state">Loading iVIEW...</div>}

      {!loading && error && <div className="iview-state error">{error}</div>}

      {!loading && !error && (
        <div className="iview-grid">
          {feedItems.map((post) => (
            <IViewCard key={post.id} item={post} />
          ))}

          {Array.from({ length: Math.max(0, 5 - feedItems.length) }).map(
            (_, index) => (
              <div key={`empty-${index}`} className="iview-card empty">
                <div className="iview-empty-media">
                  <span>No content yet</span>
                </div>
              </div>
            )
          )}

          <div className="iview-ad-slot">
            <CommunityPlusAdTv mode="page" context="iview" tvMode="idle" />
          </div>
        </div>
      )}
    </div>
  );
}