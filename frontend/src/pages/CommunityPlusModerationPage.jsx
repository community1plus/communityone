import { useEffect, useState } from "react";

export default function CommunityPlusModerationPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadQueue() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/moderation/posts`
      );

      const data = await response.json();

      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function approvePost(id) {
    await fetch(
      `${import.meta.env.VITE_API_BASE}/moderation/posts/${id}/approve`,
      {
        method: "POST",
      }
    );

    loadQueue();
  }

  async function rejectPost(id) {
    await fetch(
      `${import.meta.env.VITE_API_BASE}/moderation/posts/${id}/reject`,
      {
        method: "POST",
      }
    );

    loadQueue();
  }

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <div className="moderation-page">
      <h1>Moderation Queue</h1>

      {loading && <p>Loading...</p>}

      {!loading && posts.length === 0 && (
        <p>No posts awaiting review.</p>
      )}

      {!loading &&
        posts.map((post) => (
          <div
            key={post.id}
            className="moderation-card"
          >
            <h3>{post.title}</h3>

            <p>
              <strong>Reason:</strong>{" "}
              {post.moderation_reason}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {post.status}
            </p>

            <p>
              <strong>Created:</strong>{" "}
              {new Date(
                post.created_at
              ).toLocaleString()}
            </p>

            <div className="moderation-actions">
              <button
                onClick={() =>
                  approvePost(post.id)
                }
              >
                Approve
              </button>

              <button
                onClick={() =>
                  rejectPost(post.id)
                }
              >
                Reject
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}