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

function formatCommentTime(value) {
  if (!value) return "Just now";

  const created = new Date(value).getTime();
  const now = Date.now();

  if (Number.isNaN(created)) return "Just now";

  const minutes = Math.floor((now - created) / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function IViewMedia({
  post,
  detail = false,
  onMediaExpired,
  priority = false,
}) {
  const mediaUrl =
    getMediaUrl(post);

  const mediaType =
    getMediaType(post);

  const [
    mediaLoaded,
    setMediaLoaded,
  ] = useState(false);

  const [
    mediaFailed,
    setMediaFailed,
  ] = useState(false);

  /* ======================================================
     RESET MEDIA STATE
  ====================================================== */

  useEffect(() => {
    setMediaLoaded(false);

    setMediaFailed(false);
  }, [mediaUrl]);

  /* ======================================================
     MEDIA TIMEOUT
  ====================================================== */

  useEffect(() => {
    if (
      !mediaUrl ||
      mediaLoaded ||
      mediaFailed
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        console.warn(
          "MEDIA LOAD TIMEOUT:",
          post.id
        );

        setMediaFailed(true);

        onMediaExpired?.(
          post.id
        );
      }, MEDIA_LOAD_TIMEOUT_MS);

    return () =>
      clearTimeout(timer);
  }, [
    mediaUrl,
    mediaLoaded,
    mediaFailed,
    onMediaExpired,
    post.id,
  ]);

  /* ======================================================
     MEDIA ERROR
  ====================================================== */

  const handleMediaError =
    () => {
      console.error(
        "MEDIA FAILED:",
        post.id
      );

      setMediaFailed(true);

      onMediaExpired?.(
        post.id
      );
    };

  /* ======================================================
     MEDIA LOADED
  ====================================================== */

  const handleMediaLoaded =
    () => {
      console.log(
        "MEDIA READY:",
        post.id
      );

      requestAnimationFrame(
        () => {
          setMediaLoaded(
            true
          );
        }
      );
    };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div
      className={
        detail
          ? "iview-detail-player"
          : "iview-media"
      }
    >
      {/* MEDIA SKELETON */}

      {!mediaLoaded &&
        !mediaFailed && (
          <div className="iview-media-skeleton">
            <div className="iview-media-shimmer" />
          </div>
        )}

      {/* IMAGE */}

      {mediaUrl &&
        mediaType ===
          "image" &&
        !mediaFailed && (
          <img
            src={mediaUrl}
            alt={post.title}
            loading={
              priority
                ? "eager"
                : "lazy"
            }
            decoding="async"
            className={`iview-image ${
              mediaLoaded
                ? "loaded"
                : ""
            }`}
            onLoad={
              handleMediaLoaded
            }
            onError={
              handleMediaError
            }
          />
        )}

      {/* VIDEO */}

      {mediaUrl &&
        mediaType ===
          "video" &&
        !mediaFailed && (
          <video
            src={mediaUrl}
            className={`iview-image ${
              mediaLoaded
                ? "loaded"
                : ""
            }`}
            muted={!detail}
            playsInline
            controls={detail}
            autoPlay={detail}
            preload={
              priority
                ? "auto"
                : "metadata"
            }
            onLoadedData={
              handleMediaLoaded
            }
            onError={
              handleMediaError
            }
          />
        )}

      {/* EMPTY */}

      {(!mediaUrl ||
        mediaFailed) && (
        <div className="iview-empty-media">
          <span>
            COMMUNITY ONE
          </span>
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
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const uploader = post.uploader || post.user_id || "Community Member";

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

  useEffect(() => {
    let cancelled = false;

    async function fetchComments() {
      if (!API_BASE || !post?.id) return;

      try {
        setCommentsLoading(true);
        setCommentsError("");

        const response = await fetch(`${API_BASE}/posts/${post.id}/comments`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Could not load comments.");
        }

        if (!cancelled) {
          setComments(Array.isArray(data.comments) ? data.comments : []);
        }
      } catch (error) {
        console.error("Fetch comments failed:", error);

        if (!cancelled) {
          setComments([]);
          setCommentsError("Could not load comments.");
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    }

    fetchComments();

    return () => {
      cancelled = true;
    };
  }, [post.id]);

  const handlePostComment = async () => {
    const cleanComment = commentText.trim();

    if (!cleanComment || postingComment) return;

    try {
      setPostingComment(true);
      setCommentsError("");

      const response = await fetch(`${API_BASE}/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: cleanComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Could not post comment.");
      }

      setComments((prev) => [data.comment, ...prev]);
      setCommentText("");
    } catch (error) {
      console.error("Post comment failed:", error);
      setCommentsError("Could not post comment.");
    } finally {
      setPostingComment(false);
    }
  };

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

              <button
                type="button"
                disabled={!commentText.trim() || postingComment}
                onClick={handlePostComment}
              >
                {postingComment ? "posting..." : "post"}
              </button>
            </div>

            <div className="iview-comment-list">
              {commentsLoading && (
                <div className="iview-comment-loading">
                  Loading comments...
                </div>
              )}

              {!commentsLoading && commentsError && (
                <div className="iview-comment-loading error">
                  {commentsError}
                </div>
              )}

              {!commentsLoading && !commentsError && comments.length === 0 && (
                <div className="iview-comment-loading">
                  No comments yet. Start the discussion.
                </div>
              )}

              {!commentsLoading &&
                !commentsError &&
                comments.map((comment) => (
                  <article key={comment.id} className="iview-comment">
                    <div className="iview-comment-header">
                      <strong>{comment.user_id || "Community Member"}</strong>
                      <span>{formatCommentTime(comment.created_at)}</span>
                    </div>

                    <p>{comment.comment}</p>
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

  const fetchPosts = useCallback(async ({ silent = false } = {}) => {
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
  }, []);

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

          {Array.from({
            length: Math.max(0, FEED_LIMIT - feedItems.length),
          }).map((_, index) => (
            <div key={`empty-${index}`} className="iview-card empty">
              <div className="iview-empty-media">
                <span>No content yet</span>
              </div>
            </div>
          ))}

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