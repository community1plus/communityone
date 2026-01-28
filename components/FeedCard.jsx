import React from "react";
import "./FeedCard.css";

export default function FeedCard({ title, body, image, category, time }) {
  return (
    <div className="feed-card">
      {image && (
        <div className="feed-card-media">
          <img src={image} alt={title} loading="lazy" />
        </div>
      )}

      <div className="feed-card-body">
        <div className="feed-card-header">
          <span className="feed-card-badge">{category}</span>
          <span className="feed-card-time">{time}</span>
        </div>

        <h3 className="feed-card-title">{title}</h3>
        <p className="feed-card-text">{body}</p>
      </div>
    </div>
  );
}
