import { useEffect, useState } from "react";

export default function CommunityPlusModerationPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE;

  async function loadQueue() {
    try {
      setLoading(true);

      const response = await fetch(`${apiBase}/moderation/posts`);
      const data = await response.json();

      setPosts(Array.isArray(data?.posts) ? data.posts : []);
    } catch (error) {
      console.error("Failed to load moderation queue:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function approvePost(id) {
    try {
      setActionLoadingId(id);

      await fetch(`${apiBase}/moderation/posts/${id}/approve`, {
        method: "POST",
      });

      await loadQueue();
    } finally {
      setActionLoadingId(null);
    }
  }

  async function rejectPost(id) {
    try {
      setActionLoadingId(id);

      await fetch(`${apiBase}/moderation/posts/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Rejected by moderator",
        }),
      });

      await loadQueue();
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  const safePosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="moderation-page">
      <h1>Moderation Queue</h1>

      {loading && <p>Loading...</p>}

      {!loading && safePosts.length === 0 && (
        <p>No posts awaiting review.</p>
      )}

      {!loading &&
        safePosts.map((post) => (
          <div key={post.id} className="moderation-card">
            <h3>{post.title || "Untitled post"}</h3>

            <p>
              <strong>Reason:</strong>{" "}
              {post.moderation_reason || "No reason provided"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {post.status || "unknown"}
            </p>

            <p>
              <strong>Created:</strong>{" "}
              {post.created_at
                ? new Date(post.created_at).toLocaleString()
                : "Unknown"}
            </p>

            <div className="moderation-actions">
              <button
                type="button"
                disabled={actionLoadingId === post.id}
                onClick={() => approvePost(post.id)}
              >
                Approve
              </button>

              <button
                type="button"
                disabled={actionLoadingId === post.id}
                onClick={() => rejectPost(post.id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}