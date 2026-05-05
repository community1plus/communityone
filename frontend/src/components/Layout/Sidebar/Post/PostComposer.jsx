import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import "./PostComposer.css";

const CATEGORIES = [
  "News",
  "Opinion",
  "Events",
  "Business",
  "Food & Drink",
  "Entertainment",
  "Sport",
  "Lifestyle",
  "Health",
  "Tech & Science",
  "Alert",
];

const SCOPES = ["Local", "Nearby", "Global"];

const MODE_CONFIG = {
  now: {
    label: "NOW",
    icon: "⚡",
    theme: "theme-now panel-compact",
    titlePlaceholder: "What's happening right now?",
    bodyPlaceholder: "Quick update...",
    submitLabel: "Post Now",
    defaultCategory: "News",
    defaultScope: "Local",
    status: "published",
    requiresReview: false,
    expiresInHours: 24,
    allowPromotion: false,
    showDetails: false,
  },

  news: {
    label: "News",
    icon: "📰",
    theme: "theme-news",
    titlePlaceholder: "News headline...",
    bodyPlaceholder: "Write a clear, factual news summary...",
    submitLabel: "Submit for Review",
    defaultCategory: "News",
    defaultScope: "Local",
    status: "pending_review",
    requiresReview: true,
    expiresInHours: 168,
    allowPromotion: false,
    showDetails: true,
  },

  blob: {
    label: "BLOB",
    icon: "🧠",
    theme: "theme-blob",
    titlePlaceholder: "Headline...",
    bodyPlaceholder: "Write something detailed...",
    submitLabel: "Publish BLOB",
    defaultCategory: "Lifestyle",
    defaultScope: "Local",
    status: "published",
    requiresReview: false,
    expiresInHours: null,
    allowPromotion: true,
    showDetails: true,
  },

  event: {
    label: "Event",
    icon: "📅",
    theme: "theme-event",
    titlePlaceholder: "Event title...",
    bodyPlaceholder: "Describe the event...",
    submitLabel: "Create Event",
    defaultCategory: "Events",
    defaultScope: "Local",
    status: "published",
    requiresReview: false,
    expiresInHours: null,
    allowPromotion: false,
    showDetails: true,
  },

  beacon: {
    label: "Beacon",
    icon: "📡",
    theme: "theme-beacon",
    titlePlaceholder: "Beacon alert...",
    bodyPlaceholder: "What should people know?",
    submitLabel: "Create Beacon",
    defaultCategory: "Alert",
    defaultScope: "Local",
    status: "published",
    requiresReview: false,
    expiresInHours: 12,
    allowPromotion: false,
    showDetails: true,
  },
};

function normaliseMode(mode) {
  const clean = String(mode || "now").toLowerCase();
  return MODE_CONFIG[clean] ? clean : "now";
}

function getExpiryTimestamp(hours) {
  if (!hours) return null;
  return Date.now() + hours * 60 * 60 * 1000;
}

export default function PostComposer({
  mode: propMode,
  onSubmit,
  onCancel,
}) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const routeMode = params.mode || location.state?.mode;
  const mode = normaliseMode(propMode || routeMode || "now");
  const config = MODE_CONFIG[mode];

  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] = useState(config.defaultCategory);
  const [scope, setScope] = useState(config.defaultScope);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);

  const [isAd, setIsAd] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canPromote = config.allowPromotion;
  const showDetails = config.showDetails;

  const pageTitle = useMemo(
    () => `${config.icon} ${config.label}`,
    [config.icon, config.label]
  );

  useEffect(() => {
    setCategory(config.defaultCategory);
    setScope(config.defaultScope);
    setIsAd(false);
    setSelectedSlots([]);
    setError("");
  }, [mode, config.defaultCategory, config.defaultScope]);

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [files]);

  const addTag = (tag) => {
    const clean = tag.toLowerCase().trim();

    if (!clean || tags.includes(clean)) return;

    setTags((prev) => [...prev, clean]);
  };

  const handleTagKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const handleFiles = (incomingFiles = []) => {
    const videos = incomingFiles.filter((file) =>
      file.type.startsWith("video")
    );

    const others = incomingFiles.filter(
      (file) => !file.type.startsWith("video")
    );

    if (videos.length > 4) {
      setError("Maximum 4 videos allowed.");
      return;
    }

    if (others.length > 2) {
      setError("Maximum 2 files or images allowed.");
      return;
    }

    const enriched = incomingFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      thumbnail: null,
    }));

    setFiles((prev) => [...prev, ...enriched]);
    setError("");
  };

  const removeFile = (fileId) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === fileId);

      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }

      return prev.filter((item) => item.id !== fileId);
    });
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory(config.defaultCategory);
    setScope(config.defaultScope);
    setTags([]);
    setTagInput("");
    setFiles([]);
    setPreview(null);
    setIsAd(false);
    setSelectedSlots([]);
    setError("");
  };

  const buildPayload = () => ({
    mode,
    type: mode,
    title: title.trim(),
    content: content.trim(),
    category,
    scope,
    tags,

    media: files.map(({ file }) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    })),

    status: config.status,
    requiresReview: config.requiresReview,
    submittedAt: Date.now(),
    expiresAt: getExpiryTimestamp(config.expiresInHours),

    ad:
      canPromote && isAd
        ? {
            slots: selectedSlots,
          }
        : null,
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Add a title first.");
      return;
    }

    if (!content.trim()) {
      setError("Add some content first.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = buildPayload();

      if (onSubmit) {
        await onSubmit(payload, files);
      } else {
        console.log("Post payload:", payload);

        // Backend later:
        // await api.post("/posts", payload);
      }

      resetForm();

      navigate(`/communityplus?mode=${mode.toUpperCase()}`, {
        replace: true,
        state: { mode: mode.toUpperCase() },
      });
    } catch (err) {
      setError(err?.message || "Could not submit post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`composer panel ${config.theme}`}>
      <div className="panel-header">
        <div className="composer-title">{pageTitle}</div>

        <input
          className="body"
          placeholder={config.titlePlaceholder}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="panel-body">
        <textarea
          className={`body ${mode === "now" ? "now-text" : "blob-text"}`}
          placeholder={config.bodyPlaceholder}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        {showDetails && (
          <>
            <div className="meta">Category</div>
            <select
              className="body"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <div className="meta">Scope</div>
            <select
              className="body"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              {SCOPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <input
              className="body"
              placeholder="Add tags"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKey}
            />

            <div className="tag-list">
              {tags.map((tag) => (
                <span key={tag} className="label">
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {mode === "news" && (
          <div className="meta">
            News posts are submitted for review before they appear in iVIEW.
          </div>
        )}

        {mode === "beacon" && (
          <div className="meta">
            Beacon posts are time-sensitive alerts and expire automatically.
          </div>
        )}

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </button>

        <input
          type="file"
          hidden
          multiple
          ref={fileInputRef}
          onChange={(event) =>
            handleFiles(Array.from(event.target.files || []))
          }
        />

        <div className="files">
          {files.map((item) => (
            <div key={item.id} className="panel panel-hover panel-compact">
              {item.file.type.startsWith("image") ? (
                <img
                  src={item.url}
                  alt={item.file.name}
                  onClick={() => setPreview(item)}
                />
              ) : (
                <span className="meta">Video</span>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => removeFile(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {canPromote && (
          <>
            <label className="label">
              <input
                type="checkbox"
                checked={isAd}
                onChange={() => setIsAd((prev) => !prev)}
              />
              Promote
            </label>

            {isAd && (
              <div className="slots">
                {[...Array(24)].map((_, hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={`btn ${
                      selectedSlots.includes(hour)
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    onClick={() => {
                      setSelectedSlots((prev) =>
                        prev.includes(hour)
                          ? prev.filter((item) => item !== hour)
                          : [...prev, hour]
                      );
                    }}
                  >
                    {hour}:00
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {error && <div className="error">{error}</div>}
      </div>

      <div className="panel-footer">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : config.submitLabel}
        </button>
      </div>

      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <img src={preview.url} alt={preview.file.name} />
          </div>
        </div>
      )}
    </div>
  );
}