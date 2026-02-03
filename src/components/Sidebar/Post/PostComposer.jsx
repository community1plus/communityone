// PostComposer.jsx
import React, { useState } from "react";
import "./PostComposer.css";

export default function PostComposer() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setImage(null);
    setPreviewMode(false);
  };

  return (
    <div className="composer-wrapper">
      {/* LEFT SIDE — FORM */}
      <div className="composer-left">
        <h2 className="composer-title">Create a Post</h2>

        <label className="composer-label">Title</label>
        <input
          className="composer-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a short headline..."
        />

        <label className="composer-label">Summary</label>
        <textarea
          className="composer-textarea"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write a brief description..."
        />

        {/* ACTION BUTTONS */}
        <div className="composer-actions">

          {/* Upload Button */}
          <label className="icon-btn upload-btn">
            ⧉
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              hidden
            />
          </label>

          {/* Preview Button */}
          <button
            className="icon-btn preview-btn"
            onClick={() => setPreviewMode(true)}
          >
            ◉
          </button>

          {/* Cancel Button */}
          <button className="icon-btn cancel-btn" onClick={resetForm}>
            ×
          </button>
        </div>
      </div>

      {/* RIGHT SIDE — PREVIEW */}
      <div className="composer-right">
        <h3 className="preview-title">Live Preview</h3>

        {previewMode && (
          <div className="preview-card">
            {image && <img src={image} alt="preview" className="preview-img" />}
            <h4 className="preview-card-title">{title || "Untitled Post"}</h4>
            <p className="preview-card-text">{summary || "No summary added yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
