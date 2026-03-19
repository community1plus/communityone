import React, { useState } from "react";
import "./PostComposer.css";

export default function PostComposer({ setActiveView }) {
const [title, setTitle] = useState("");
const [summary, setSummary] = useState("");
const [files, setFiles] = useState([]);
const [previewMode, setPreviewMode] = useState(false);
const [dragActive, setDragActive] = useState(false);

/* =====================================================
IMAGE COMPRESSION
===================================================== */

const compressImage = (file) => {
return new Promise((resolve) => {
if (!file.type.startsWith("image/")) return resolve(file);

```
  const img = new Image();
  const reader = new FileReader();

  reader.onload = (e) => (img.src = e.target.result);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxWidth = 1200;
    const scale = Math.min(maxWidth / img.width, 1);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      resolve(new File([blob], file.name, { type: "image/jpeg" }));
    }, "image/jpeg", 0.75);
  };

  reader.readAsDataURL(file);
});
```

};

/* =====================================================
FILE PROCESSING
===================================================== */

const processFiles = async (selectedFiles) => {
if (!selectedFiles?.length) return;

```
const compressed = await Promise.all(
  selectedFiles.map((file) => compressImage(file))
);

const mapped = compressed.map((file) => ({
  file,
  url: URL.createObjectURL(file),
  id: crypto.randomUUID(),
  progress: 0,
}));

setFiles((prev) => [...prev, ...mapped]);
setPreviewMode(true);

// simulate upload
mapped.forEach((f) => {
  const interval = setInterval(() => {
    setFiles((prev) =>
      prev.map((p) =>
        p.id === f.id
          ? { ...p, progress: Math.min(p.progress + 10, 100) }
          : p
      )
    );
  }, 120);

  setTimeout(() => clearInterval(interval), 1200);
});
```

};

/* =====================================================
EVENTS
===================================================== */

const handleUpload = (e) => {
processFiles(Array.from(e.target.files));
};

const handleDrop = (e) => {
e.preventDefault();
setDragActive(false);
processFiles(Array.from(e.dataTransfer.files));
};

const handleDelete = (id) => {
setFiles((prev) => {
const file = prev.find((f) => f.id === id);
if (file) URL.revokeObjectURL(file.url);
return prev.filter((f) => f.id !== id);
});
};

const handleDragStart = (e, index) => {
e.dataTransfer.setData("index", index);
};

const handleDropReorder = (e, index) => {
const from = e.dataTransfer.getData("index");
if (from === null) return;

```
setFiles((prev) => {
  const updated = [...prev];
  const [moved] = updated.splice(from, 1);
  updated.splice(index, 0, moved);
  return updated;
});
```

};

const resetForm = () => {
files.forEach((f) => URL.revokeObjectURL(f.url));
setFiles([]);
setTitle("");
setSummary("");
setPreviewMode(false);
};

/* =====================================================
UI
===================================================== */

return ( <div className="post-composer"> <div className="composer-wrapper">

```
    {/* LEFT */}
    <div className="composer-left">

      <h2 className="composer-title">Create a Post</h2>

      <input
        className="composer-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a headline..."
      />

      <textarea
        className="composer-textarea"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Write something..."
      />

      {/* 🔥 PREMIUM DROP ZONE */}
      <label
        className={`drop-zone ${dragActive ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="drop-zone-inner">
          <span className="drop-title">
            Drag & drop images
          </span>
          <span className="drop-sub">
            or click to upload
          </span>
        </div>

        <input
          type="file"
          multiple
          onChange={handleUpload}
          hidden
        />
      </label>

      {/* ACTIONS */}
      <div className="composer-actions">

        <label className="btn icon-btn">
          ⧉
          <input type="file" multiple onChange={handleUpload} hidden />
        </label>

        <button
          className="icon-btn preview-btn"
          onClick={() => setPreviewMode(true)}
        >
          ◉
        </button>

        <button
          className="icon-btn reset-btn"
          onClick={resetForm}
        >
          ↺
        </button>

        <button
          className="icon-btn cancel-btn"
          onClick={() => {
            resetForm();
            setActiveView("dashboard");
          }}
        >
          ×
        </button>

      </div>

    </div>

    {/* RIGHT */}
    <div className="composer-right">

      <div className="preview-scroll">

        {files.length === 0 ? (

          <div className="empty-preview fade-in">
            <p className="empty-text">
              Upload images to preview your post
            </p>

            <img
              src="/logo/logo.png"
              alt="logo"
              className="empty-logo"
            />
          </div>

        ) : (

          <div className="preview-grid fade-in">

            {files.map((f, index) => (
              <div
                key={f.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropReorder(e, index)}
                className="preview-grid-item"
              >
                <img src={f.url} className="preview-grid-img" />

                {f.progress < 100 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}

                <button
                  className="delete-overlay"
                  onClick={() => handleDelete(f.id)}
                >
                  ×
                </button>
              </div>
            ))}

          </div>

        )}

      </div>

    </div>

  </div>
</div>
```

);
}
