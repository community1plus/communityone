import React, { useCallback, useMemo } from "react";
import "./CommunityPlusFeedCard.css";

const ACTIVITY_CONFIG = {
  now: {
    icon: "⚡",
    label: "NOW",
  },
  incident: {
    icon: "🚨",
    label: "Incident",
  },
  event: {
    icon: "📅",
    label: "Event",
  },
  beacon: {
    icon: "📡",
    label: "Beacon",
  },
  blob: {
    icon: "🧠",
    label: "BLOB",
  },
  alert: {
    icon: "⚠️",
    label: "Alert",
  },
  post: {
    icon: "📝",
    label: "Post",
  },
  welcome: {
    icon: "🏠",
    label: "Welcome",
  },
};

function normaliseType(type = "post") {
  return String(type || "post").toLowerCase();
}

function getActivityConfig(type) {
  return ACTIVITY_CONFIG[normaliseType(type)] || ACTIVITY_CONFIG.post;
}

function formatDistance(distance) {
  if (distance === null || distance === undefined || distance === "") {
    return "Distance unavailable";
  }

  if (typeof distance === "number") {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }

    return `${distance.toFixed(distance >= 10 ? 0 : 1)} km away`;
  }

  return String(distance);
}

export default function FeedCard({
  id,

  title = "",
  text = "This is a sample activity update in the community feed.",
  time = "Just now",
  distance = null,
  image = null,

  type = "post",
  location = null,
  active = false,
  onSelect,
}) {
  const activity = useMemo(() => getActivityConfig(type), [type]);

  const displayTitle = title || text || "Community activity";
  const displayDistance = formatDistance(distance);

  const handleClick = useCallback(() => {
    if (onSelect && location) {
      onSelect({
        id,
        location,
        type,
      });
    }
  }, [onSelect, location, id, type]);

  return (
    <article
      className={["feed-card", active && "active"].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      <div className="feed-card-row feed-card-title-row">
        <span className="feed-activity-icon" aria-hidden="true">
          {activity.icon}
        </span>

        <div className="feed-title-group">
          <span className="feed-activity-label">{activity.label}</span>
          <h3 className="feed-title">{displayTitle}</h3>
        </div>
      </div>

      <div className="feed-card-row feed-card-time-row">
        <span className="feed-row-spacer" aria-hidden="true" />
        <span className="feed-time">{time}</span>
      </div>

      <div className="feed-card-row feed-card-location-row">
        <span className="feed-row-spacer" aria-hidden="true" />
        <span className="feed-location">
          <span className="feed-pin" aria-hidden="true">
            📍
          </span>
          {displayDistance}
        </span>
      </div>

      {image && (
        <img
          src={image}
          alt={displayTitle}
          className="feed-image"
          loading="lazy"
        />
      )}
    </article>
  );
}