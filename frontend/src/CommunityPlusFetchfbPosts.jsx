import React, { useEffect, useState } from "react";
import "../src/CommunityPlusFetchfbPosts.css";

export default function CommunityPlusFetchfbPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://dc8bv7xdyf.execute-api.us-east-1.amazonaws.com/dev/fbposts-dev")
      .then((res) => res.json())
      .then((data) => {
        console.log("FB API Response:", data);  // 👈 check if token expired / error
        setPosts(data.posts || []);
        setPage(data.page || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading Facebook posts...</p>;

  return (
    <div className="news-feed">
      {posts.map((post, i) => (
        <div key={i} className="news-card">
          {/* Header */}
          <div className="news-header">
            {page?.picture?.data?.url && (
              <img
                src={page.picture.data.url}
                alt={page.name}
                className="news-avatar"
              />
            )}
            <div>
              <div className="news-publisher">{page?.name || "Community+ " }</div>
              <div className="news-time">
                {new Date(post.created_time).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Message */}
          {post.message && <div className="news-message">{post.message}</div>}

          {/* Image */}
          {post.full_picture && (
            <img
              src={post.full_picture}
              alt="Post attachment"
              className="news-image"
            />
          )}

          {/* Footer */}
          <div className="news-footer">
            <a
              href={post.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Facebook
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
