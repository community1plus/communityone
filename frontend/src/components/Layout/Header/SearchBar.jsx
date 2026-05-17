// =========================================================
// SearchBar.jsx
// =========================================================

import React, {
  useEffect,
  useState,
} from "react";

import useSearch from "../../../hooks/useSearch";

/*import "./SearchBar.css";*/

export default function SearchBar() {
  const {
    query,
    setQuery,

    results,

    loading,

    summary,

    suggestions,

    search,
  } = useSearch();

  const [debouncedQuery, setDebouncedQuery] =
    useState("");

  /* ======================================================
     DEBOUNCE
  ====================================================== */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  /* ======================================================
     SEARCH
  ====================================================== */

  useEffect(() => {
    if (!debouncedQuery?.trim()) return;

    search(debouncedQuery);
  }, [debouncedQuery]);

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="search-bar-wrapper">
      {/* SEARCH INPUT */}

      <input
        className="search-input"
        placeholder="Search your area..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
      />

      {/* LOADING */}

      {loading && (
        <div className="search-loading">
          Searching...
        </div>
      )}

      {/* AI SUMMARY */}

      {!!summary && (
        <div className="search-summary">
          {summary}
        </div>
      )}

      {/* SUGGESTIONS */}

      {!!suggestions?.length && (
        <div className="search-suggestions">
          {suggestions.map((item) => (
            <button
              key={item}
              className="search-suggestion-pill"
              onClick={() => {
                setQuery(item);

                search(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* RESULTS */}

      {!!results?.length && (
        <div className="search-results">
          {results.map((result) => (
            <div
              key={result.id}
              className="search-result-card"
            >
              <div className="search-result-type">
                {result.type}
              </div>

              <div className="search-result-title">
                {result.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}