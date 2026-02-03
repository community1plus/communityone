import React, { useState } from "react";
import FeedCard from "../../FeedCard/FeedCard";
import "./PostComposer.css";

export default function PostComposer() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [posts, setPosts] = useState([]);

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      const preview = URL.createObjectURL(uploaded);
      setFile(preview);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !summary.trim()) return;

    const newPost = {
      id: Date.now(),
      title,
      summary,
      image: file
    };

    setPosts([newPost, ...posts]);

    // Clear fields
    setTitle("");
    setSummary("");
    setFile(null);
  };

  return (
    <div className="post-composer">

      {/* LEFT COLUMN — FORM */}
      <div className="post-form">
        <h2>Create Post</h2>

        <label>Title</label>
        <input
          className="post-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Summary</label>
        <textarea
          className="post-textarea"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <label>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
        />

        {file && (
          <img src={file} className="post-preview-image" alt="preview"/>
        )}

        <button className="post-submit-btn" onClick={handleSubmit}>
          Submit Post
        </button>
      </div>

      {/* RIGHT COLUMN — LIVE PREVIEW */}
      <div className="post-preview">
        <h2>Preview</h2>

        {posts.length === 0 && (
          <p className="empty-preview">No posts yet...</p>
        )}

        {posts.map((p) => (
          <FeedCard
            key={p.id}
            title={p.title}
            summary={p.summary}
            image={p.image}
          />
        ))}
      </div>

    </div>
  );
}
