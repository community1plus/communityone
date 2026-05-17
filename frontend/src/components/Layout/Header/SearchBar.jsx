// =========================================================
// SearchBar.jsx
// =========================================================

import React from "react";

import useSearch from "../../../hooks/useSearch";

export default function SearchBar() {
  console.log(
    "REAL SearchBar.jsx LOADED"
  );

  const {
    searchQuery,
    setSearchQuery,

    results,

    suggestions,

    summary,

    loading,

    search,
  } = useSearch();

  /* ======================================================
     INPUT CHANGE
  ====================================================== */

  const handleChange = (e) => {
    const value = e.target.value;

    setSearchQuery(value);

    search(value);
  };

  /* ======================================================
     CLEAR SEARCH
  ====================================================== */

  const handleClose = () => {
    setSearchQuery("");
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
     OVERLAY VISIBILITY
  ====================================================== */

  const showOverlay =
    loading ||
    !!summary ||
    !!suggestions?.length ||
    !!results?.length;

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="search-bar-wrapper">
      {/* SEARCH INPUT */}

      <input
        type="text"
        className="search-input"
        placeholder="Search Community One..."
        value={searchQuery}
        onChange={handleChange}
      />

      {/* SEARCH OVERLAY */}

      {showOverlay && (
        <div className="search-overlay">
          {/* CLOSE */}

          <button
            className="search-close"
            onClick={handleClose}
          >
            ✕
          </button>

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
              {results.map(
                (result) => (
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
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
/** */