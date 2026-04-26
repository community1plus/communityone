import React, { useCallback } from "react";
import "./CommunityPlusFeedCard.css";

export default function FeedCard({
  id,
  avatar = "/logo/logo.png",
  name = "Community Member",
  time = "Just now",
  text = "This is a sample activity update in the community feed.",
  image = null,

  /* 🔥 NEW */
  type = "post",           // incident | event | alert | post
  location = null,
  active = false,
  onSelect,
}) {

  /* =========================
     CLICK HANDLER
  ========================= */

  const handleClick = useCallback(() => {
    if (onSelect && location) {
      onSelect({ id, location, type });
    }
  }, [onSelect, location, id, type]);

  /* =========================
     RENDER
  ========================= */

  return (
    <div
      className={[
        "feed-card",
        active && "active",
        `type-${type}`, // 🔥 enables styling by type
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
    >

      {/* HEADER */}
      <div className="feed-card-header">

        {/* avatar optional */}
        {/* <img src={avatar} alt="avatar" className="feed-avatar" /> */}

        <div className="feed-meta">
          <span className="feed-name">{name}</span>
          <span className="feed-time">{time}</span>
        </div>

      </div>

      {/* TEXT */}
      <p className="feed-text">{text}</p>

      {/* IMAGE */}
      {image && (
        <img
          src={image}
          alt="post"
          className="feed-image"
        />
      )}

    </div>
  );
}