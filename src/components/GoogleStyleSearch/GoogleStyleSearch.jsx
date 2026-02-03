import React, { useState } from "react";
import "./GoogleStyleSearch.css";

export default function GoogleStyleSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = [
    "Restaurants near me",
    "Local events",
    "Crime reports",
    "Community posts",
    "Lost & Found",
    "Weather alerts"
  ].filter((s) => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={`gsearch ${focused ? "focused" : ""}`}>
      <input
        className="gsearch-input"
        placeholder="Search community updates..."
        value={query}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onChange={(e) => setQuery(e.target.value)}
      />

      {focused && (
        <div className="gsearch-dropdown">
          {suggestions.length > 0 ? (
            suggestions.map((s, idx) => (
              <div key={idx} className="gsearch-suggestion">
                {s}
              </div>
            ))
          ) : (
            <div className="gsearch-empty">No suggestions</div>
          )}
        </div>
      )}
    </div>
  );
}
