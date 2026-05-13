import { useCallback, useEffect, useMemo, useState } from "react";
import "./CommunityPlusIViewPage.css";

import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "");

const FEED_LIMIT = 5;
const FEED_REFRESH_MS = 5 * 60 * 1000;
const MEDIA_LOAD_TIMEOUT_MS = 8000;

const MOCK_COMMENTS = [
  {
    id: "c1",
    user: "Community Member",
    text: "This is useful. I saw something similar nearby.",
    createdAt: "2m ago",
  },
  {
    id: "c2",
    user: "Local Viewer",
    text: "Can someone confirm if this is still current?",
    createdAt: "6m ago",
  },
];

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

function formatDate(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function IViewMedia({ post, detail = false, onMediaExpired }) {
  const mediaUrl = getMediaUrl(post);
  const mediaType = getMediaType(post);

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);

  useEffect(() => {
    setMediaLoaded(false);
    setMediaFailed(false);
  }, [mediaUrl]);

  useEffect(() => {
    if (!mediaUrl || mediaLoaded || mediaFailed) return;

    const timer = setTimeout(() => {
      setMediaFailed(true);

      if (onMediaExpired) {
        onMediaExpired(post.id);
      }
    }, MEDIA_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [mediaUrl, mediaLoaded, mediaFailed, onMediaExpired, post.id]);

  const handleMediaError = () => {
    setMediaFailed(true);

    if (onMediaExpired) {
      onMediaExpired(post.id);
    }
  };

  return (
    <div className={detail ? "iview-detail-player" : "iview-media"}>
      {mediaUrl && !mediaLoaded && !mediaFailed && (
        <div className="iview-media-loading">
          <span>Loading media...</span>
        </div>
      )}

      {mediaUrl && mediaType === "image" && !mediaFailed && (
        <img
          src={mediaUrl}
          alt={post.title}
          className={`iview-image ${mediaLoaded ? "loaded" : ""}`}
          onLoad={() => setMediaLoaded(true)}
          onError={handleMediaError}
        />
      )}

      {mediaUrl && mediaType === "video" && !mediaFailed && (
        <video
          src={mediaUrl}
          className={`iview-image ${mediaLoaded ? "loaded" : ""}`}
          muted={!detail}
          playsInline
          controls={detail}
          autoPlay={detail}
          onLoadedData={() => setMediaLoaded(true)}
          onError={handleMediaError}
        />
      )}

      {(!mediaUrl || mediaFailed) && (
        <div className="iview-empty-media">
          <span>COMMUNITY ONE</span>
        </div>
      )}
    </div>
  );
}

function IViewCard({ item, onOpen, onMediaExpired }) {
  return (
    <article className="iview-card" onClick={() => onOpen(item)}>
      <IViewMedia post={item} onMediaExpired={onMediaExpired} />

      <div className="iview-meta">
        <button
          type="button"
          className="iview-title"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(item);
          }}
        >
          {item.title}
        </button>

        <div className="iview-subline">
          <span>{item.uploader || item.user_id || "Community Member"}</span>
          <span>•</span>
          <span>{formatViews(item.views)} views</span>
        </div>

        <button
          type="button"
          className="iview-track"
          onClick={(event) => event.stopPropagation()}
        >
          track
        </button>
      </div>
    </article>
  );
}

function IViewDetailPanel({ post, onClose, onMediaExpired }) {
  const [commentText, setCommentText] = useState("");

  const uploader = post.uploader || post.user_id || "Community Member";
  const comments = post.comments || MOCK_COMMENTS;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <section
      className="iview-detail-shell"
      aria-label="iVIEW content panel"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <button type="button" className="iview-detail-close" onClick={onClose}>
        ×
      </button>

      <div
        className="iview-detail-layout"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <main className="iview-detail-main">
          <IViewMedia post={post} detail onMediaExpired={onMediaExpired} />

          <div className="iview-detail-actions">
            <span>{formatViews(post.views)} views</span>

            <button type="button">track</button>
            <button type="button">discuss</button>
          </div>

          <section className="iview-detail-description">
            <h1>{post.title}</h1>

            <p>{post.content || "No description has been added yet."}</p>

            <div className="iview-detail-meta">
              <span>{uploader}</span>
              <span>•</span>
              <span>{post.category || "Community"}</span>
              <span>•</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </section>
        </main>

        <aside className="iview-detail-side">
          <section className="iview-ai-summary">
            <div className="iview-side-label">AI summary</div>
            <p>
              Community discussion will be summarised here as comments are added.
              The summary will highlight key themes, concerns, confirmations and
              useful local context.
            </p>
          </section>

          <section className="iview-comments">
            <div className="iview-side-label">Comments</div>

            <div className="iview-comment-box">
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Respond to this post..."
              />

              <button type="button" disabled={!commentText.trim()}>
                post
              </button>
            </div>

            <div className="iview-comment-list">
              {comments.map((comment) => (
                <article key={comment.id} className="iview-comment">
                  <div className="iview-comment-header">
                    <strong>{comment.user}</strong>
                    <span>{comment.createdAt}</span>
                  </div>

                  <p>{comment.text}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

export default function CommunityPlusIViewPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(
    async ({ silent = false } = {}) => {
      if (!API_BASE) {
        setError("Backend API is not configured.");
        setLoading(false);
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(`${API_BASE}/posts?limit=${FEED_LIMIT}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Could not fetch posts.");
        }

        const nextPosts = Array.isArray(data.posts) ? data.posts : [];

        setPosts(nextPosts);

        setSelectedPost((current) => {
          if (!current) return null;

          return nextPosts.find((post) => post.id === current.id) || current;
        });
      } catch (err) {
        setError(err?.message || "Could not load iVIEW feed.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts({ silent: true });
    }, FEED_REFRESH_MS);

    return () => clearInterval(interval);
  }, [fetchPosts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPosts({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchPosts]);

  const handleMediaExpired = useCallback(() => {
    fetchPosts({ silent: true });
  }, [fetchPosts]);

  const feedItems = useMemo(() => posts.slice(0, FEED_LIMIT), [posts]);

  return (
    <div className="iview-page">
      {loading && <div className="iview-state">Loading iVIEW...</div>}

      {!loading && error && <div className="iview-state error">{error}</div>}

      {!loading && !error && !selectedPost && (
        <div className="iview-grid">
          {feedItems.map((post) => (
            <IViewCard
              key={post.id}
              item={post}
              onOpen={setSelectedPost}
              onMediaExpired={handleMediaExpired}
            />
          ))}

          {Array.from({ length: Math.max(0, FEED_LIMIT - feedItems.length) }).map(
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

          {refreshing && (
            <div className="iview-refresh-indicator">Refreshing media...</div>
          )}
        </div>
      )}

      {!loading && !error && selectedPost && (
        <IViewDetailPanel
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onMediaExpired={handleMediaExpired}
        />
      )}
    </div>
  );
}