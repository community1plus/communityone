import React from "react";

import useSearch from "../../../hooks/useSearch";

export default function SearchBar() {
    console.log(
  "REAL SearchBar.jsx LOADED"
);
  const {
    query,
    setQuery,

    results,

    suggestions,

    summary,

    loading,

    search,
  } = useSearch();

  const handleChange = async (e) => {
    const value = e.target.value;

    setQuery(value);

    search(value);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search Community One..."
        value={query}
        onChange={handleChange}
      />

      {loading && (
        <div>Searching...</div>
      )}

      {!!summary && (
        <div className="search-summary">
          {summary}
        </div>
      )}

      {!!suggestions.length && (
        <div className="search-suggestions">
          {suggestions.map((item) => (
            <button key={item}>
              {item}
            </button>
          ))}
        </div>
      )}

      {!!results.length && (
        <div className="search-results">
          {results.map((result) => (
            <div
              key={result.id}
              className="search-result-card"
            >
              <strong>
                {result.title}
              </strong>

              <div>
                {result.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}