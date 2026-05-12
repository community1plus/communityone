import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";

import "./PostComposer.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "");

const MAX_VIDEO_AUDIO_SIZE = 300 * 1024 * 1024;

const ALLOWED_FILE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "pdf",
  "doc",
  "docx",
  "txt",
  "rtf",
  "odt",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "mp4",
  "mov",
  "webm",
  "mp3",
  "wav",
  "m4a",
];

const NOW_CATEGORIES = ["Information", "Incident", "Alert", "Event", "Beacon"];

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
    defaultCategory: "Information",
    defaultScope: "Local",
    defaultTags: ["General"],
    status: "published",
    requiresReview: false,
    expiresInHours: 24,
    allowPromotion: false,
    showDetails: true,
    showNowOptions: true,
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
    defaultTags: ["News"],
    status: "pending_review",
    requiresReview: true,
    expiresInHours: 168,
    allowPromotion: false,
    showDetails: true,
    showNowOptions: false,
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
    defaultTags: ["General"],
    status: "published",
    requiresReview: false,
    expiresInHours: null,
    allowPromotion: true,
    showDetails: true,
    showNowOptions: false,
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
    defaultTags: ["Events"],
    status: "published",
    requiresReview: false,
    expiresInHours: null,
    allowPromotion: false,
    showDetails: true,
    showNowOptions: false,
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
    defaultTags: ["General"],
    status: "published",
    requiresReview: false,
    expiresInHours: 12,
    allowPromotion: false,
    showDetails: true,
    showNowOptions: false,
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

function getFileExtension(fileName = "") {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function sanitizeText(value = "") {
  return String(value)
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

function sanitizeFileName(fileName = "") {
  return String(fileName)
    .replace(/[^\w.\-()\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

function parseCustomTags(input = "") {
  return input
    .split(/[\s,]+/)
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean)
    .map((tag) => sanitizeText(tag).replace(/[^\w\s&-]/g, ""))
    .filter(Boolean);
}

function uniqueTags(tags = []) {
  const seen = new Set();

  return tags.filter((tag) => {
    const key = String(tag).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatFileSize(size = 0) {
  if (!size) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );

  const value = size / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDateTime(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getMediaKind(file) {
  if (file.type.startsWith("image")) return "image";
  if (file.type.startsWith("video")) return "video";
  if (file.type.startsWith("audio")) return "audio";
  return "document";
}

function validateIncomingFile(file, existingItems = []) {
  const kind = getMediaKind(file);
  const extension = getFileExtension(file.name);

  if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
    return `${file.name} is not an allowed file type.`;
  }

  if (
    (kind === "video" || kind === "audio") &&
    file.size > MAX_VIDEO_AUDIO_SIZE
  ) {
    return `${file.name} exceeds the 300 MB limit for video/audio.`;
  }

  if (kind === "video" && existingItems.some((item) => item.kind === "video")) {
    return "Only one video file is allowed per post.";
  }

  if (kind === "audio" && existingItems.some((item) => item.kind === "audio")) {
    return "Only one audio file is allowed per post.";
  }

  if (
    kind === "document" &&
    existingItems.some((item) => item.kind === "document")
  ) {
    return "Only one document file is allowed per post.";
  }

  return "";
}

async function getAuthHeaders(extraHeaders = {}) {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

async function apiFetch(path, options = {}) {
  if (!API_BASE) {
    throw new Error("Backend API is not configured.");
  }

  const cleanBase = API_BASE.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${cleanBase}${cleanPath}`;

  const response = await fetch(url, options);

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || `API request failed: ${response.status}`);
  }

  return data;
}

export default function PostComposer({ mode: propMode, onSubmit, onCancel }) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const routeMode = params.mode || location.state?.mode;
  const mode = normaliseMode(propMode || routeMode || "now");
  const config = MODE_CONFIG[mode];

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("compose");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(config.defaultCategory);
  const [scope, setScope] = useState(config.defaultScope);
  const [customTagInput, setCustomTagInput] = useState("");
  const [shareToSocial, setShareToSocial] = useState(false);
  const [shareToGlobal, setShareToGlobal] = useState(false);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [metadataModal, setMetadataModal] = useState(null);
  const [loadedMediaIds, setLoadedMediaIds] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [isAd, setIsAd] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");

  const canPromote = config.allowPromotion;
  const showDetails = config.showDetails;
  const hasFiles = files.length > 0;

  const finalTags = useMemo(() => {
    const customTags = parseCustomTags(customTagInput);

    if (!customTags.length) {
      return config.defaultTags || ["General"];
    }

    return uniqueTags(customTags);
  }, [customTagInput, config.defaultTags]);

  const categoryOptions = useMemo(
    () => (mode === "now" ? NOW_CATEGORIES : CATEGORIES),
    [mode]
  );

  useEffect(() => {
    setActiveTab("compose");
    setCategory(config.defaultCategory);
    setScope(config.defaultScope);
    setCustomTagInput("");
    setShareToSocial(false);
    setShareToGlobal(false);
    setIsAd(false);
    setSelectedSlots([]);
    setUploadProgress("");
    setError("");
  }, [mode, config]);

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [files]);

  const markMediaLoaded = (fileId) => {
    setLoadedMediaIds((prev) => ({
      ...prev,
      [fileId]: true,
    }));
  };

  const isMediaLoaded = (fileId) => Boolean(loadedMediaIds[fileId]);

  const handleFiles = (incomingFiles = []) => {
    const validFiles = [];

    for (const file of incomingFiles) {
      const simulatedExisting = [
        ...files,
        ...validFiles.map((validFile) => ({
          kind: getMediaKind(validFile),
        })),
      ];

      const validationError = validateIncomingFile(file, simulatedExisting);

      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);
    }

    const enriched = validFiles.map((file) => {
      const createdAt = Date.now();
      const safeName = sanitizeFileName(file.name);

      return {
        id: crypto.randomUUID(),
        file,
        kind: getMediaKind(file),
        url: URL.createObjectURL(file),
        thumbnail: null,
        uploaded: false,
        s3Key: null,
        publicUrl: null,
        safeName,
        metadata: {
          name: safeName,
          originalName: file.name,
          type: file.type || "application/octet-stream",
          extension: getFileExtension(file.name),
          size: file.size,
          sizeLabel: formatFileSize(file.size),
          createdAt,
          createdAtLabel: formatDateTime(createdAt),
          lastModified: file.lastModified,
          lastModifiedLabel: formatDateTime(file.lastModified),
        },
      };
    });

    setFiles((prev) => [...prev, ...enriched]);
    setError("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const droppedFiles = Array.from(event.dataTransfer.files || []);

    if (droppedFiles.length) {
      handleFiles(droppedFiles);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!submitting) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === fileId);

      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }

      return prev.filter((item) => item.id !== fileId);
    });

    setMetadataModal((current) => (current?.id === fileId ? null : current));
    setPreview((current) => (current?.id === fileId ? null : current));

    setLoadedMediaIds((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
  };

  const clearComposerText = () => {
    setTitle("");
    setContent("");
    setError("");
  };

  const resetForm = () => {
    setActiveTab("compose");
    setTitle("");
    setContent("");
    setCategory(config.defaultCategory);
    setScope(config.defaultScope);
    setCustomTagInput("");
    setShareToSocial(false);
    setShareToGlobal(false);

    files.forEach((item) => {
      if (item.url) URL.revokeObjectURL(item.url);
    });

    setFiles([]);
    setPreview(null);
    setMetadataModal(null);
    setLoadedMediaIds({});
    setDragActive(false);
    setIsAd(false);
    setSelectedSlots([]);
    setUploadProgress("");
    setError("");
  };

  const buildPayload = (uploadedMedia = []) => ({
    mode,
    type: mode,
    title: sanitizeText(title),
    content: sanitizeText(content),
    category: sanitizeText(category),
    scope: shareToGlobal ? "Global" : sanitizeText(scope),
    tags: finalTags.map(sanitizeText).filter(Boolean),
    shareToSocial,
    shareToGlobal,
    media: uploadedMedia,
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

  const uploadSingleFile = async (item, index, total) => {
    const headers = await getAuthHeaders();
    const safeName = item.safeName || sanitizeFileName(item.file.name);

    setUploadProgress(`Preparing upload ${index + 1} of ${total}...`);

    const presign = await apiFetch("/posts/upload-url", {
      method: "POST",
      headers,
      body: JSON.stringify({
        fileName: safeName,
        originalFileName: item.file.name,
        fileType: item.file.type,
        fileSize: item.file.size,
        mediaType: item.kind,
        extension: item.metadata.extension,
        mode,
      }),
    });

    if (!presign?.uploadUrl || !presign?.key) {
      throw new Error("Upload URL was not returned by backend.");
    }

    setUploadProgress(`Uploading ${safeName}...`);

    const uploadResponse = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": item.file.type || "application/octet-stream",
      },
      body: item.file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed for ${safeName}`);
    }

    return {
      name: safeName,
      originalName: item.file.name,
      type: item.file.type,
      size: item.file.size,
      mediaType: item.kind,
      extension: item.metadata.extension,
      key: presign.key,
      url: presign.publicUrl || presign.fileUrl || null,
      createdAt: item.metadata.createdAt,
      lastModified: item.file.lastModified,
    };
  };

  const uploadFilesToS3 = async () => {
    if (!files.length) return [];

    const uploaded = [];

    for (let index = 0; index < files.length; index += 1) {
      const result = await uploadSingleFile(files[index], index, files.length);
      uploaded.push(result);
    }

    setUploadProgress("Upload complete.");
    return uploaded;
  };

  const submitToBackend = async (payload) => {
    const headers = await getAuthHeaders();

    return apiFetch("/posts", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  };

  const handleSubmit = async () => {
    if (!sanitizeText(title)) {
      setError("Add a title first.");
      setActiveTab("compose");
      return;
    }

    if (!sanitizeText(content)) {
      setError("Add some content first.");
      setActiveTab("compose");
      return;
    }

    setSubmitting(true);
    setError("");
    setUploadProgress("");

    try {
      let uploadedMedia = [];

      if (onSubmit) {
        const payload = buildPayload(
          files.map(({ file, kind, metadata, safeName }) => ({
            name: safeName || sanitizeFileName(file.name),
            originalName: file.name,
            type: file.type,
            size: file.size,
            mediaType: kind,
            extension: metadata.extension,
            createdAt: metadata.createdAt,
            lastModified: file.lastModified,
          }))
        );

        await onSubmit(payload, files);
      } else {
        uploadedMedia = await uploadFilesToS3();

        const payload = buildPayload(uploadedMedia);

        await submitToBackend(payload);
      }

      resetForm();

      navigate(`/communityplus?mode=${mode.toUpperCase()}`, {
        replace: true,
        state: { mode: mode.toUpperCase() },
      });
    } catch (err) {
      console.error("Post submit failed:", err);
      setError(err?.message || "Could not submit post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-composer-page">
      <div className="composer-column">
        <div
          className={`composer panel ${config.theme} ${
            dragActive ? "drag-active" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="panel-header">
            <div className="composer-tab-row">
              <button
                type="button"
                className={`composer-tab ${
                  activeTab === "compose" ? "active" : ""
                }`}
                onClick={() => setActiveTab("compose")}
                disabled={submitting}
              >
                {config.label}
              </button>

              {showDetails && (
                <>
                  <span className="composer-tab-divider">|</span>

                  <button
                    type="button"
                    className={`composer-tab ${
                      activeTab === "options" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("options")}
                    disabled={submitting}
                  >
                    Set Options
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="panel-body">
            {activeTab === "compose" && (
              <>
                <input
                  className="body"
                  placeholder={config.titlePlaceholder}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />

                <textarea
                  className={`body ${mode === "now" ? "now-text" : "blob-text"}`}
                  placeholder={config.bodyPlaceholder}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />

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

                {files.length === 0 && (
                  <button
                    type="button"
                    className={`upload-drop-zone ${dragActive ? "active" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                  >
                    <span className="upload-icon">⬆</span>

                    <span className="upload-title">
                      {dragActive
                        ? "Drop files here"
                        : "Upload media or drag files here"}
                    </span>

                    <span className="upload-help">
                      Max 300 MB for video/audio. One video, one audio and one
                      document per post. Allowed: PNG, JPEG, PDF, Word, TXT and
                      standard document files.
                    </span>
                  </button>
                )}

                {files.length > 0 && (
                  <div className="upload-complete-note">
                    Media added. Use the right panel to preview, inspect or delete
                    files.
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  multiple
                  ref={fileInputRef}
                  onChange={(event) => {
                    handleFiles(Array.from(event.target.files || []));
                    event.target.value = "";
                  }}
                />

                {canPromote && (
                  <>
                    <label className="label">
                      <input
                        type="checkbox"
                        checked={isAd}
                        onChange={() => setIsAd((prev) => !prev)}
                        disabled={submitting}
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
                            disabled={submitting}
                          >
                            {hour}:00
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {uploadProgress && <div className="meta">{uploadProgress}</div>}
                {error && <div className="error">{error}</div>}
              </>
            )}

            {activeTab === "options" && (
              <div className="composer-options-pane">
                <div className="composer-options-grid">
                  <label className="composer-field">
                    <span className="meta">Category</span>

                    <select
                      className="body"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      {categoryOptions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label className="composer-field">
                    <span className="meta">Scope</span>

                    <select
                      className="body"
                      value={scope}
                      onChange={(event) => setScope(event.target.value)}
                      disabled={shareToGlobal}
                    >
                      {SCOPES.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="meta">Tags</div>

                <input
                  className="body"
                  placeholder="Add hashtags, e.g. #traffic #storm #food"
                  value={customTagInput}
                  onChange={(event) => setCustomTagInput(event.target.value)}
                />

                <div className="tag-list">
                  {finalTags.map((tag) => (
                    <span key={tag} className="label">
                      #{tag}
                    </span>
                  ))}
                </div>

                {config.showNowOptions && (
                  <div className="share-options">
                    <label className="label">
                      <input
                        type="checkbox"
                        checked={shareToSocial}
                        onChange={(event) =>
                          setShareToSocial(event.target.checked)
                        }
                        disabled={submitting}
                      />
                      Share to social
                    </label>

                    <label className="label">
                      <input
                        type="checkbox"
                        checked={shareToGlobal}
                        onChange={(event) =>
                          setShareToGlobal(event.target.checked)
                        }
                        disabled={submitting}
                      />
                      Share to global
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTab === "compose" && (
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

              <div className="composer-action-icons">
                <button
                  type="button"
                  className="composer-icon-action"
                  onClick={resetForm}
                  disabled={submitting}
                  title="Reset"
                  aria-label="Reset form"
                >
                  ↺
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  className="composer-icon-action"
                  onClick={clearComposerText}
                  disabled={submitting}
                  title="Clear"
                  aria-label="Clear text"
                >
                  ⌫
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  className="composer-icon-action primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  title="Submit"
                  aria-label="Submit post"
                >
                  ➤
                  <span>{submitting ? "Submitting..." : "Submit"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="guide-column">
        <aside className="composer-guide-panel panel">
          <h2>Media</h2>

          {!hasFiles && (
            <p>
              Uploaded files will appear here as thumbnails. Drag media onto the
              composer or use the upload button.
            </p>
          )}

          {hasFiles && (
            <div className="media-thumb-list">
              {files.map((item) => (
                <div key={item.id} className="media-thumb-card">
                  <div className="media-thumb-row">
                    <div className="media-thumb-preview">
                      {(item.kind === "image" || item.kind === "video") &&
                        !isMediaLoaded(item.id) && (
                          <div className="media-loading">Loading...</div>
                        )}

                      {item.kind === "image" && (
                        <img
                          src={item.url}
                          alt={item.metadata.name}
                          onLoad={() => markMediaLoaded(item.id)}
                          className={
                            isMediaLoaded(item.id) ? "loaded" : "loading"
                          }
                        />
                      )}

                      {item.kind === "video" && (
                        <video
                          src={item.url}
                          muted
                          playsInline
                          onLoadedData={() => markMediaLoaded(item.id)}
                          className={
                            isMediaLoaded(item.id) ? "loaded" : "loading"
                          }
                        />
                      )}

                      {item.kind === "audio" && (
                        <div className="media-file-icon">♪</div>
                      )}

                      {item.kind === "document" && (
                        <div className="media-file-icon">📄</div>
                      )}
                    </div>

                    <div className="media-thumb-info">
                      <strong title={item.metadata.name}>
                        {item.metadata.name}
                      </strong>
                      <span>{item.metadata.sizeLabel}</span>
                    </div>

                    <div className="media-thumb-actions">
                      <button
                        type="button"
                        title="Preview"
                        aria-label={`Preview ${item.metadata.name}`}
                        onClick={() => setPreview(item)}
                      >
                        👁
                      </button>

                      <button
                        type="button"
                        title="Metadata"
                        aria-label={`Show metadata for ${item.metadata.name}`}
                        onClick={() => setMetadataModal(item)}
                      >
                        ⓘ
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        aria-label={`Delete ${item.metadata.name}`}
                        onClick={() => removeFile(item.id)}
                        disabled={submitting}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasFiles && (
            <>
              <div className="guide-divider" />

              <h2>{config.label} Guide</h2>

              {mode === "now" && (
                <p>
                  NOW posts are short, immediate updates for what is happening
                  around the user right now. They expire automatically after 24
                  hours.
                </p>
              )}

              {mode === "news" && (
                <p>
                  News posts should be factual, clear, and suitable for review
                  before publication.
                </p>
              )}

              {mode === "blob" && (
                <p>
                  BLOB posts are longer-form commentary, stories, opinions, and
                  community reflections.
                </p>
              )}

              {mode === "event" && (
                <p>
                  Event posts should include what is happening, where, when, and
                  who should attend.
                </p>
              )}

              {mode === "beacon" && (
                <p>
                  Beacon posts are urgent alerts. Keep them short, accurate, and
                  time-sensitive.
                </p>
              )}

              <div className="meta">
                Media uploads are sent to S3 using backend-generated signed URLs.
              </div>
            </>
          )}
        </aside>
      </div>

      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <div
            className="media-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {preview.kind === "image" && (
              <img src={preview.url} alt={preview.metadata.name} />
            )}

            {preview.kind === "video" && (
              <video src={preview.url} controls autoPlay />
            )}

            {preview.kind === "audio" && <audio src={preview.url} controls />}

            {preview.kind === "document" && (
              <div className="file-preview-box">
                <strong>{preview.metadata.name}</strong>
                <span>{preview.metadata.sizeLabel}</span>
              </div>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPreview(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {metadataModal && (
        <div className="modal" onClick={() => setMetadataModal(null)}>
          <div
            className="metadata-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>File metadata</h3>

            <div className="metadata-modal-grid">
              <div>
                <span>File name</span>
                <strong>{metadataModal.metadata.name}</strong>
              </div>

              <div>
                <span>Original file name</span>
                <strong>{metadataModal.metadata.originalName}</strong>
              </div>

              <div>
                <span>Created</span>
                <strong>{metadataModal.metadata.createdAtLabel}</strong>
              </div>

              <div>
                <span>File size</span>
                <strong>{metadataModal.metadata.sizeLabel}</strong>
              </div>

              <div>
                <span>Timestamp</span>
                <strong>{metadataModal.metadata.lastModifiedLabel}</strong>
              </div>

              <div>
                <span>Type</span>
                <strong>{metadataModal.metadata.type}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMetadataModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}