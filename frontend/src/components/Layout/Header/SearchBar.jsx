// =========================================================
// SearchBar.jsx
// =========================================================

import React, {
  useEffect,
  useState,
} from "react";

import useSearch from "../../../hooks/useSearch";

export default function SearchBar() {
  console.log(
    "REAL SearchBar.jsx LOADED"
  );

  const {
    /* QUERY */

    searchQuery,
    setSearchQuery,

    /* DATA */

    results,
    suggestions,
    summary,

    /* STATE */

    loading,

    /* ACTIONS */

    search,
    clearSearch,
  } = useSearch();

  /* ======================================================
     DEBOUNCED QUERY
  ====================================================== */

  const [
    debouncedQuery,
    setDebouncedQuery,
  ] = useState("");

  /* ======================================================
     DEBOUNCE EFFECT
  ====================================================== */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(
        searchQuery
      );
    }, 300);

    return () =>
      clearTimeout(timeout);
  }, [searchQuery]);

  /* ======================================================
     SEARCH EFFECT
  ====================================================== */

  useEffect(() => {
    if (
      !debouncedQuery?.trim()
    ) {
      return;
    }

    search(debouncedQuery);
  }, [
    debouncedQuery,
    search,
  ]);

  /* ======================================================
     INPUT CHANGE
  ====================================================== */

  const handleChange = (e) => {
    const value = e.target.value;

    setSearchQuery(value);

    if (!value?.trim()) {
      clearSearch();
    }
  };

  /* ======================================================
     CLOSE OVERLAY
  ====================================================== */

  const handleClose = () => {
    clearSearch();
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
            type="button"
            className="search-clear"
            onClick={clearSearch}
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
            type="button"
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
                    type="button"
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