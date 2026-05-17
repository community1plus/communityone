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
    setResults,

    suggestions,
    setSuggestions,

    summary,
    setSummary,

    loading,

    search,
  } = useSearch();

  /* ======================================================
     INPUT CHANGE
  ====================================================== */

  const handleChange = (e) => {
    const value = e.target.value;

    setSearchQuery(value);

    if (!value?.trim()) {
      handleClear();

      return;
    }

    search(value);
  };

  /* ======================================================
     CLEAR SEARCH
  ====================================================== */

  const handleClear = () => {
    setSearchQuery("");

    setResults([]);

    setSuggestions([]);

    setSummary("");
  };

  /* ======================================================
     CLOSE OVERLAY
  ====================================================== */

  const handleClose = () => {
    handleClear();
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
     SHOW CLEAR BUTTON
  ====================================================== */

  const showClear =
    !!searchQuery?.trim();

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="search-bar-wrapper">
      {/* SEARCH INPUT WRAPPER */}

      <div className="search-input-wrapper">
        {/* SEARCH INPUT */}

        <input
          type="text"
          className="search-input"
          placeholder="Search Community One..."
          value={searchQuery}
          onChange={handleChange}
        />

        {/* CLEAR BUTTON */}

        {showClear && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ⟲
          </button>
        )}
      </div>

      {/* SEARCH OVERLAY */}

      {showOverlay && (
        <div className="search-overlay">
          {/* CLOSE */}

          <button
            className="search-close"
            onClick={handleClose}
            aria-label="Close search"
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