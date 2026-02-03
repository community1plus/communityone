// FeedCard.jsx
import React from "react";
import "./FeedCard.css";

export default function FeedCard({ items = [] }) {
  return (
    <div className="feed-column">
      
      {/* Header */}
      <div className="feed-header">LIVE FEED</div>

      {/* Feed Items */}
      {items.map((item, index) => (
        <div className="feed-card" key={index}>
          
          {/* Title */}
          <div className="feed-card-title">{item.title}</div>

          {/* Distance + Location */}
          <div className="feed-card-meta">
            <span className="meta-dot-teal"></span>
            {item.distance}m • {item.location}
          </div>

          {/* Time */}
          <div className="feed-card-meta">
            <span className="meta-dot-red"></span>
            {item.timeAgo}
          </div>
          
        </div>
      ))}

    </div>
  );
}
