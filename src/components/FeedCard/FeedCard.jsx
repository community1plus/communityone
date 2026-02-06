import React from "react";
import "./FeedCard.css";

export default function FeedCard({ 
  avatar = "/logo/logo.png",
  name = "Community Member",
  time = "Just now",
  text = "This is a sample activity update in the community feed.",
  image = null
}) {
  return (
    <div className="feed-card">

      {/* Header Row */}
      <div className="feed-card-header">
        <img src={avatar} alt="avatar" className="feed-avatar" />

        <div className="feed-meta">
          <span className="feed-name">{name}</span>
          <span className="feed-time">{time}</span>
        </div>
      </div>

      {/* Content Text */}
      <p className="feed-text">{text}</p>

      {/* Optional Image */}
      {image && (
        <img src={image} alt="post" className="feed-image" />
      )}

    </div>
  );
}
