// =========================================================
// SearchBar.jsx
// =========================================================

import React, {
  useEffect,
  useState,
} from "react";

import useSearch from "../../../hooks/useSearch";

/* import "./SearchBar.css"; */

export default function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,

    results,

    loading,

    summary,

    suggestions,

    search,
  } = useSearch();

  const [
    debouncedQuery,
    setDebouncedQuery,
  ] = useState("");

  /* ======================================================
     DEBUG
  ====================================================== */

  console.log(
    "SEARCH BAR STATE:",
    {
      searchQuery,
      setSearchQuery,
      type: typeof setSearchQuery,
    }
  );

  /* ======================================================
     DEBOUNCE
  ====================================================== */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  /* ======================================================
     SEARCH
  ====================================================== */

  useEffect(() => {
    if (!debouncedQuery?.trim()) {
      return;
    }

    search(debouncedQuery);
  }, [debouncedQuery, search]);

  /* ======================================================
     INPUT CHANGE
  ====================================================== */

  const handleInputChange = (e) => {
    const value = e.target.value;

    console.log(
      "INPUT CHANGE:",
      value
    );

    console.log(
      "SET SEARCH QUERY TYPE:",
      typeof setSearchQuery
    );

    if (
      typeof setSearchQuery !==
      "function"
    ) {
      console.error(
        "setSearchQuery is not a function"
      );

      return;
    }

    setSearchQuery(value);
  };

  /* ======================================================
     SUGGESTION CLICK
  ====================================================== */

  const handleSuggestionClick = (
    suggestion
  ) => {
    setSearchQuery(suggestion);

    search(suggestion);
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="search-bar-wrapper">
      {/* SEARCH INPUT */}

      <input
        className="search-input"
        placeholder="Search your area..."
        value={searchQuery}
        onChange={handleInputChange}
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
          {suggestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                className="search-suggestion-pill"
                onClick={() =>
                  handleSuggestionClick(
                    suggestion
                  )
                }
              >
                {suggestion}
              </button>
            )
          )}
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