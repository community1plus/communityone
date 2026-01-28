import React, { useState } from "react";
import { signOut } from "aws-amplify/auth";
import CommunityPlusUploadForm from "./CommunityPlusUploadForm";

export default function CommunityPlusSidebar({ setActiveView }) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <li className="sidebar-item" onClick={() => setShowModal(true)}>
          ➕ Add News
        </li>
        <li className="sidebar-item" onClick={() => setActiveView("events")}>
          📅 Add Event
        </li>
        <li className="sidebar-item" onClick={() => setActiveView("posts")}>
          💬 Opinion
        </li>

        <hr className="sidebar-divider" />

        <li className="sidebar-item logout" onClick={handleLogout}>
          🚪 Logout
        </li>
      </aside>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>

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

            <div className="modal-body">
              {activeTab === "upload" && (
                <div>
                  <CommunityPlusUploadForm
                    onSubmit={(formData) => {
                      if (formData.files) {
                        setUploadedFiles(Array.from(formData.files));
                      }
                      setActiveTab("preview");
                    }}
                  />

                  {uploadedFiles.length > 0 && (
                    <div className="preview-grid">
                      {uploadedFiles.map((file, i) => {
                        const url = URL.createObjectURL(file);
                        return file.type.startsWith("image/") ? (
                          <img
                            key={i}
                            src={url}
                            alt={file.name}
                            className="preview-thumb"
                          />
                        ) : (
                          <video
                            key={i}
                            src={url}
                            controls
                            className="preview-thumb"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "preview" && (
                <div>
                  <h3>Preview</h3>

                  {uploadedFiles.length === 0 ? (
                    <p>No files uploaded yet.</p>
                  ) : (
                    <div className="preview-grid">
                      {uploadedFiles.map((file, i) => {
                        const url = URL.createObjectURL(file);
                        return file.type.startsWith("image/") ? (
                          <img key={i} src={url} alt={file.name} className="preview-thumb" />
                        ) : (
                          <video key={i} src={url} controls className="preview-thumb" />
                        );
                      })}
                    </div>
                  )}

                  <button onClick={() => setActiveView("submit")}>
                    Continue →
                  </button>
                </div>
              )}

              {activeTab === "submit" && (
                <div>
                  <h3>Submit</h3>
                  <p>Final review before publishing.</p>
                  <button
                    className="submit-btn"
                    onClick={() => {
                      console.log("Submitted!");
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
    </>
  );
}
