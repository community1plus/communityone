<div className="preview-scroll">

  {/* ALWAYS show files if they exist */}
  {files.length > 0 && !previewMode && (
    <div className="file-list">
      {files.map((f) => (
        <div key={f.id} className="file-row">
          <span className="file-name">{f.file.name}</span>

          <div className="file-actions">
            <button
              className="file-btn preview tooltip"
              data-tooltip="Preview file"
              onClick={() => window.open(f.url, "_blank")}
            >
              👁
            </button>

            <button
              className="file-btn delete tooltip"
              data-tooltip="Remove file"
              onClick={() => handleDelete(f.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* EMPTY STATE */}
  {files.length === 0 && !previewMode && (
    <div className="empty-state">
      No files uploaded yet
    </div>
  )}

  {/* PREVIEW MODE */}
  {previewMode && (
    <div className="preview-card">
      <img
        src="/logo/logo.png"
        alt="logo-preview"
        className="preview-img primary-logo"
      />

      {files.length > 0 ? (
        files.map((f) => (
          <img
            key={f.id}
            src={f.url}
            alt="preview"
            className="preview-img"
          />
        ))
      ) : (
        <div className="empty-state">
          No images to preview
        </div>
      )}

      <h4 className="preview-card-title">
        {title || "Untitled Post"}
      </h4>

      <p className="preview-card-text">
        {summary || "No summary added yet."}
      </p>
    </div>
  )}

</div>