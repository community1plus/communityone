import React from "react";
import "./LocationPin.css";

export default function LocationPin({
  resolved = false,
  loading = false,
  onClick,
  title,
}) {
  return (
    <span
      className={`location-pin ${
        resolved ? "resolved" : "unresolved"
      } ${loading ? "loading" : ""}`}
      onClick={onClick}
      title={title}
    >
      {loading ? "⏳" : "📍"}
    </span>
  );
}