import React, { useState } from "react";
import "./PostComposer.css";

export default function PostComposer() {
  const [category, setCategory] = useState("post");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const categories = ["post", "event", "incident", "beacon"];

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  return (
    <div className="post-composer">

      <div className="composer-wrapper">

        {/* ================= LEFT PANEL ================= */}
        <div className="composer-left">

          {/* HEADER */}
          <div>
            <h2>Create a Post</h2>

            <div className="category-row">
              {categories.map((c) => (
                <div
                  key={c}
                  className={`category-chip ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </div>
              ))}
            </div>
          </div>

          {/* INPUTS */}
          <div className="form-section">
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
          </div>

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
              <div className="drop-title">Drag & drop images</div>
              <div className="drop-sub">or click to upload</div>
            </label>
          </div>

          {/* ACTIONS */}
          <div className="composer-actions">
            <button className="icon-btn">📷</button>
            <button className="icon-btn">📍</button>
            <button className="icon-btn">ℹ️</button>
            <button className="icon-btn">↻</button>
            <button className="icon-btn cancel-btn">✕</button>
          </div>

        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="composer-right">

          <div className="preview-scroll">

            {images.length === 0 ? (
              <div className="empty-preview">
                <img
                  src="/logo/logo.png"
                  alt="preview"
                  className="empty-logo"
                />
                <div className="empty-text">
                  Upload images to preview your post
                </div>
              </div>
            ) : (
              <div className="preview-grid">
                {images.map((file, i) => (
                  <div key={i} className="preview-grid-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="preview-grid-img"
                    />

                    <button
                      className="delete-overlay"
                      onClick={() =>
                        setImages(images.filter((_, idx) => idx !== i))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}