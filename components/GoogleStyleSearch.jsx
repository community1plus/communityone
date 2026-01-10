import React, { useState } from "react";

export default function GoogleStyleSearch() {
  const [query, setQuery] = useState("");

  return (
    <div className="google-search">
      <span className="icon search">🔍</span>

      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Show ❌ only if input has text */}
      {query && (
        <span className="icon clear" onClick={() => setQuery("")}>
          ❌
        </span>
      )}

      <span className="icon mic">🎤</span>
      <span className="icon lens">📷</span>
    </div>
  );
}
