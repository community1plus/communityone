import React, { useState } from "react";
import "./PostComposer.css";

export default function PostComposer() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  /* =========================
     HELPERS
  ========================= */

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileType = (file) => {
    if (file.type.startsWith("image")) return "image";
    if (file.type.startsWith("video")) return "video";
    if (file.type.startsWith("audio")) return "audio";
    return "file";
  };

  /* =========================
     FILE HANDLING
  ========================= */

  const validateFile = (file) => {
    if (file.type.startsWith("video") && file.size > 300 * 1024 * 1024) {
      alert("Video exceeds 300MB limit");
      return false;
    }
    return true;
  };

  const handleFiles = (incoming) => {
    const valid = incoming.filter(validateFile);

    const enriched = valid.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }));

    setFiles((prev) => [...prev, ...enriched]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleUpload = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const previewFile = (file) => {
    const url = URL.createObjectURL(file);
    window.open(url);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="post-composer">
      <div className="composer-wrapper">

        {/* ================= LEFT ================= */}
        <div className="composer-left">

          <h2>Create a Post</h2>

          <input
            className="composer-input"
            placeholder="Enter a headline..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="composer-textarea"
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* DROP ZONE */}
          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              hidden
              id="fileUpload"
              onChange={handleUpload}
            />

            <label htmlFor="fileUpload" className="drop-zone-inner">
              <div className="drop-title">Drag & drop files</div>
              <div className="drop-sub">Images, Video (≤300MB), Audio, PDF</div>
            </label>
          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="composer-right">

          {files.length === 0 ? (
            <div className="empty-preview">
              <div className="empty-text">
                Upload content to preview your post
              </div>
            </div>
          ) : (
            <div className="file-list">

              {files.map(({ file, url, id, createdAt }) => {
                const type = getFileType(file);

                return (
                  <div key={id} className="file-row">

                    {/* THUMBNAIL */}
                    <div className="file-thumb">
                      {type === "image" && (
                        <img src={url} alt="" />
                      )}

                      {type === "video" && (
                        <video src={url} />
                      )}

                      {type === "audio" && <span>🎧</span>}
                      {type === "file" && <span>📄</span>}
                    </div>

                    {/* INFO */}
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        {formatSize(file.size)} • {file.type}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="file-actions">
                      <button onClick={() => previewFile(file)}>👁</button>
                      <button onClick={() => removeFile(id)}>✕</button>

                      <button
                        onClick={() =>
                          alert(
                            `Name: ${file.name}\nSize: ${formatSize(
                              file.size
                            )}\nType: ${file.type}\nUploaded: ${createdAt}`
                          )
                        }
                      >
                        ℹ️
                      </button>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}