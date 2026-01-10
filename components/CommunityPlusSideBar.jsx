import React, { useState } from "react";
import "../src/CommunityPlusSidebar.css";
import { signOut } from "aws-amplify/auth";

export default function CommunityPlusSidebar() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadCategory, setUploadCategory] = useState("news");

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const openModal = (category) => {
    setUploadCategory(category);
    setActiveTab("upload");
    setShowModal(true);
  };

  return (
    <div className="sidebar">
      {/* Sidebar menu */}
      <ul className="sidebar-menu">
        <li className="sidebar-item" onClick={() => openModal("news")}>
          ➕ News
        </li>
        <li className="sidebar-item" onClick={() => openModal("event")}>
          📅 Event
        </li>
        <li className="sidebar-item" onClick={() => openModal("opinion")}>
          💬 Messaging
        </li>
        <hr className="sidebar-divider" />
        <li className="sidebar-item" onClick={handleSignOut}>
          🚪 Logout
        </li>
      </ul>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✖
            </button>

            {/* Tabs */}
            <div className="modal-tabs">
              <span
                className={`tab ${activeTab === "upload" ? "active" : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                UPLOAD
              </span>
              <span
                className={`tab ${activeTab === "preview" ? "active" : ""}`}
                onClick={() => setActiveTab("preview")}
              >
                PREVIEW
              </span>
              <span
                className={`tab ${activeTab === "submit" ? "active" : ""}`}
                onClick={() => setActiveTab("submit")}
              >
                SUBMIT
              </span>
            </div>

            {/* Tab content */}
            <div className="modal-body">
              {activeTab === "upload" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);

                    // grab files for preview
                    const files = formData.getAll("files");
                    setUploadedFiles(files);

                    console.log("Form Data:", Object.fromEntries(formData));
                    setActiveTab("preview");
                  }}
                >
                  <div className="form-field">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" required />
                  </div>

                  <div className="form-field">
                    <label htmlFor="blurb">Blurb</label>
                    <textarea id="blurb" name="blurb" rows="3" required />
                  </div>

                  <div className="form-field">
                    <label htmlFor="files">Upload File</label>
                    <input type="file" id="files" name="files" multiple />
                  </div>

                  <button type="submit" className="submit-btn">
                    Continue →
                  </button>
                </form>
              )}

              {activeTab === "preview" && (
                <div className="preview-container">
                  <h3>Preview ({uploadCategory})</h3>
                  {uploadedFiles.length === 0 ? (
                    <p>No files uploaded yet.</p>
                  ) : (
                    <div className="preview-grid">
                      {uploadedFiles.map((file, idx) => {
                        const url = URL.createObjectURL(file);
                        return file.type.startsWith("image/") ? (
                          <img
                            key={idx}
                            src={url}
                            alt={file.name}
                            className="preview-thumb"
                          />
                        ) : file.type.startsWith("video/") ? (
                          <video
                            key={idx}
                            src={url}
                            controls
                            className="preview-thumb"
                          />
                        ) : (
                          <p key={idx}>{file.name}</p>
                        );
                      })}
                    </div>
                  )}
                  <button onClick={() => setActiveTab("submit")}>
                    Continue to Submit →
                  </button>
                </div>
              )}

              {activeTab === "submit" && (
                <div>
                  <h3>Submit ({uploadCategory})</h3>
                  <p>Final review and confirmation step.</p>
                  <button
                    className="submit-btn"
                    onClick={() => {
                      console.log("Submitted successfully!");
                      setShowModal(false);
                      setUploadedFiles([]);
                    }}
                  >
                    ✅ Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
