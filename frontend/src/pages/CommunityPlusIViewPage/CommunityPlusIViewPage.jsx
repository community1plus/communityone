import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./CommunityPlusIViewPage.css";

import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";

import {
  useIViewSession,
} from "../../context/IViewSessionContext";

import { useUserLocation } from "../../context/LocationProvider";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "");

const FEED_LIMIT = 5;
const FEED_REFRESH_MS = 10 * 60 * 1000;
const MEDIA_LOAD_TIMEOUT_MS = 8000;

/* =========================================================
   HELPERS
========================================================= */

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

  return `${Math.floor(hours / 24)}d ago`;
}

/* =========================================================
   MEDIA
========================================================= */

function IViewMedia({
  post,
  detail = false,
  onMediaExpired,
  priority = false,
}) {
  const mediaUrl = getMediaUrl(post);
  const mediaType = getMediaType(post);

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);

  // TEXT ONLY POSTS
  if (!mediaUrl) {
    return (
      <div className="iview-no-media">
        <div className="iview-no-media-logo">
          COMMUNITY ONE
        </div>

        <div className="iview-no-media-text">
          Local community update
        </div>
      </div>
    );
  }

  useEffect(() => {
    setMediaLoaded(false);
    setMediaFailed(false);
  }, [mediaUrl]);

  useEffect(() => {
    if (mediaLoaded || mediaFailed) return;

    const timer = setTimeout(() => {
      console.warn("MEDIA LOAD TIMEOUT:", post.id);
      setMediaFailed(true);
      onMediaExpired?.(post.id);
    }, MEDIA_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [
    mediaLoaded,
    mediaFailed,
    onMediaExpired,
    post.id,
  ]);

  const handleMediaError = () => {
    console.error("MEDIA FAILED:", post.id);
    setMediaFailed(true);
    onMediaExpired?.(post.id);
  };

  const handleMediaLoaded = () => {
    requestAnimationFrame(() => {
      setMediaLoaded(true);
    });
  };

  return (
    <div
      className={
        detail
          ? "iview-detail-player"
          : "iview-media"
      }
    >
      {!mediaLoaded && !mediaFailed && (
        <div className="iview-media-skeleton">
          <div className="iview-media-shimmer" />
        </div>
      )}

      {mediaType === "image" && !mediaFailed && (
        <img
          src={mediaUrl}
          alt={post.title || "Community One post"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`iview-image ${mediaLoaded ? "loaded" : ""}`}
          onLoad={handleMediaLoaded}
          onError={handleMediaError}
        />
      )}

      {mediaType === "video" && !mediaFailed && (
        <video
          src={mediaUrl}
          className={`iview-image ${mediaLoaded ? "loaded" : ""}`}
          muted={!detail}
          playsInline
          controls={detail}
          autoPlay={detail}
          preload={priority ? "auto" : "metadata"}
          onLoadedData={handleMediaLoaded}
          onError={handleMediaError}
        />
      )}

      {mediaFailed && (
        <div className="iview-empty-media">
          <span>COMMUNITY ONE</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function IViewCard({
  item,
  onOpen,
  onMediaExpired,
  priority = false,
}) {
  return (
    <article
      className="iview-card"
      onClick={() => onOpen(item)}
    >
      <IViewMedia
        post={item}
        priority={priority}
        onMediaExpired={onMediaExpired}
      />

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
          <span>
            {item.uploader ||
              item.user_id ||
              "Community Member"}
          </span>

          <span>•</span>

          <span>
            {formatViews(item.views)} views
          </span>
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

/* =========================================================
   DETAIL PANEL
========================================================= */

function IViewDetailPanel({
  post,
  onClose,
  onMediaExpired,
}) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const uploader =
    post.uploader ||
    post.user_id ||
    "Community Member";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
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

        const response = await fetch(
          `${API_BASE}/posts/${post.id}/comments`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Could not load comments."
          );
        }

        if (!cancelled) {
          setComments(
            Array.isArray(data.comments)
              ? data.comments
              : []
          );
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

      const response = await fetch(
        `${API_BASE}/posts/${post.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: cleanComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Could not post comment."
        );
      }

      setComments((prev) => [
        data.comment,
        ...prev,
      ]);

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
      <button
        type="button"
        className="iview-detail-close"
        onClick={onClose}
      >
        ×
      </button>

      <div
        className="iview-detail-layout"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <main className="iview-detail-main">
          <IViewMedia
            post={post}
            detail
            onMediaExpired={onMediaExpired}
          />

          <div className="iview-detail-actions">
            <span>
              {formatViews(post.views)} views
            </span>

            <button type="button">
              track
            </button>

            <button type="button">
              discuss
            </button>
          </div>

          <section className="iview-detail-description">
            <h1>{post.title}</h1>

            <p>
              {post.content ||
                "No description has been added yet."}
            </p>

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
            <div className="iview-side-label">
              AI summary
            </div>

            <p>
              Community discussion will be summarised here as
              comments are added.
            </p>
          </section>

          <section className="iview-comments">
            <div className="iview-side-label">
              Comments
            </div>

            <div className="iview-comment-box">
              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(event.target.value)
                }
                placeholder="Respond to this post..."
              />

              <button
                type="button"
                disabled={
                  !commentText.trim() ||
                  postingComment
                }
                onClick={handlePostComment}
              >
                {postingComment
                  ? "posting..."
                  : "post"}
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

              {!commentsLoading &&
                !commentsError &&
                comments.length === 0 && (
                  <div className="iview-comment-loading">
                    No comments yet.
                  </div>
                )}

              {!commentsLoading &&
                !commentsError &&
                comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="iview-comment"
                  >
                    <div className="iview-comment-header">
                      <strong>
                        {comment.user_id ||
                          "Community Member"}
                      </strong>

                      <span>
                        {formatCommentTime(comment.created_at)}
                      </span>
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

/* =========================================================
   PAGE
========================================================= */

export default function CommunityPlusIViewPage() {
  const {
    displayLocation,
    loading: locationLoading,
  } = useUserLocation();

  const lat = displayLocation?.lat;
  const lng = displayLocation?.lng;

  const {
    cachedFeed,
    setCachedFeed,
    selectedPost,
    setSelectedPost,
    scrollPosition,
  } = useIViewSession();

  const [posts, setPosts] = useState(cachedFeed || []);
  const [loading, setLoading] = useState(!cachedFeed?.length);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = scrollPosition.current;
    });
  }, [scrollPosition]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    scrollPosition.current =
      containerRef.current.scrollTop;
  }, [scrollPosition]);

  const fetchPosts = useCallback(
    async ({ silent = false } = {}) => {
      if (!API_BASE) {
        setError("Backend API is not configured.");
        setLoading(false);
        return;
      }

      if (!lat || !lng) {
        if (!silent) {
          setError("");
          setLoading(true);
        }

        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams({
          limit: String(FEED_LIMIT),
          scope: "LOCAL",
          lat: String(lat),
          lng: String(lng),
          radiusKm: "5",
        });

        const response = await fetch(
          `${API_BASE}/posts/iview?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Could not fetch posts."
          );
        }

        const nextPosts =
          Array.isArray(data.posts)
            ? data.posts
            : [];

        setPosts(nextPosts);
        setCachedFeed(nextPosts);

        setSelectedPost((current) => {
          if (!current) return null;

          return (
            nextPosts.find(
              (post) => post.id === current.id
            ) || current
          );
        });
      } catch (err) {
        console.error("iVIEW FETCH ERROR:", err);

        setError(
          err?.message ||
            "Could not load iVIEW feed."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      setCachedFeed,
      setSelectedPost,
      lat,
      lng,
    ]
  );

  useEffect(() => {
    if (!lat || !lng) return;
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    fetchPosts();
  }, [lat, lng, fetchPosts]);

  useEffect(() => {
    if (!lat || !lng) return;

    const interval = setInterval(() => {
      fetchPosts({
        silent: true,
      });
    }, FEED_REFRESH_MS);

    return () => clearInterval(interval);
  }, [lat, lng, fetchPosts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && lat && lng) {
        fetchPosts({
          silent: true,
        });
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchPosts, lat, lng]);

  const handleMediaExpired = useCallback(() => {
    fetchPosts({
      silent: true,
    });
  }, [fetchPosts]);

  const feedItems = useMemo(
    () => posts.slice(0, FEED_LIMIT),
    [posts]
  );

  return (
    <div
      ref={containerRef}
      className="iview-page"
      onScroll={handleScroll}
    >
      {loading && (
        <div className="iview-state">
          {locationLoading
            ? "Finding your local area..."
            : "Loading local iVIEW..."}
        </div>
      )}

      {!loading && error && (
        <div className="iview-state error">
          {error}
        </div>
      )}

      {!loading && !error && !selectedPost && (
        <div className="iview-grid">
          {feedItems.map((post, index) => (
            <IViewCard
              key={post.id}
              item={post}
              priority={index < 2}
              onOpen={setSelectedPost}
              onMediaExpired={handleMediaExpired}
            />
          ))}

          {Array.from({
            length: Math.max(
              0,
              FEED_LIMIT - feedItems.length
            ),
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="iview-card empty"
            >
              <div className="iview-empty-media">
                <span>No content yet</span>
              </div>
            </div>
          ))}

          <div className="iview-ad-slot">
            <CommunityPlusAdTv
              mode="page"
              context="iview"
              tvMode="idle"
            />
          </div>

          {refreshing && (
            <div className="iview-refresh-indicator">
              Refreshing media...
            </div>
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