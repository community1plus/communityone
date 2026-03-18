import React, { useState } from "react";
import "./PostComposer.css";

export default function PostComposer({ setActiveView }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  // HANDLE MULTIPLE FILES
  const handleUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const mappedFiles = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));

    setFiles((prev) => [...prev, ...mappedFiles]);
  };

  // DELETE FILE
  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setFiles([]);
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
          <label
            className="icon-btn upload-btn"
            title="Add files"
          >
            ⧉
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              hidden
            />
          </label>

          {/* Preview Button */}
          <button
            className="icon-btn preview-btn"
            title="Preview post"
            onClick={() => setPreviewMode(true)}
          >
            ◉
          </button>

          {/* Reset */}
          <button
            className="icon-btn reset-btn"
            title="Reset form"
            onClick={resetForm}
          >
            ↺
          </button>

          {/* Cancel */}
          <button
            className="icon-btn cancel-btn"
            title="Cancel and go back"
            onClick={() => {
              resetForm();
              setActiveView("dashboard");
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="composer-right">
        <h3 className="preview-title">
          {files.length > 0 ? "Uploaded Files" : "Live Preview"}
        </h3>

        {/* FILE LIST MODE */}
        {files.length > 0 && (
          <div className="file-list">
            {files.map((f) => (
              <div key={f.id} className="file-item">
                
                {/* IMAGE PREVIEW */}
                <img
                  src={f.url}
                  alt="upload"
                  className="file-preview"
                />

                {/* DELETE BUTTON */}
                <button
                  className="file-delete"
                  title="Remove file"
                  onClick={() => handleDelete(f.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PREVIEW MODE */}
        {previewMode && (
          <div className="preview-card">

            {/* STATIC LOGO */}
            <img
              src="/logo/logo.png"
              alt="logo-preview"
              className="preview-img primary-logo"
            />

            {/* ALL UPLOADED IMAGES */}
            {files.map((f) => (
              <img
                key={f.id}
                src={f.url}
                alt="preview"
                className="preview-img"
              />
            ))}

            <h4 className="preview-card-title">
              {title || "Untitled Post"}
            </h4>

            <p className="preview-card-text">
              {summary || "No summary added yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}