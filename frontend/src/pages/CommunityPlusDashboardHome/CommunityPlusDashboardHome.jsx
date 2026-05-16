import { useCallback, useEffect, useMemo, useState } from "react";
import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";
import CommunityMap from "../../components/Map/CommunityMap";
import FeedCard from "../../components/FeedCard/CommunityPlusFeedCard";

/* keep your existing FEED_ITEMS, DEFAULT_FEED_CARD, FILTERS,
   and helper functions exactly as they are above this point */

export default function CommunityPlusDashboardHome() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("local");
  const [searchResults, setSearchResults] = useState([]);

  const { focusOnMarker } = useMap();

  const handleSearch = useCallback(
    (event) => {
      const value = event.target.value;
      setSearchQuery(value);

      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

      const results = FEED_ITEMS.filter((item) => {
        const haystack = `
          ${item.title}
          ${item.content}
          ${item.type}
        `.toLowerCase();

        return haystack.includes(value.toLowerCase());
      });

      setSearchResults(results);
    },
    [searchMode]
  );

  const handleSearchSelect = useCallback(
    (result) => {
      if (!result?.location) return;
      focusOnMarker(result.location, result.id);
      setSearchResults([]);
    },
    [focusOnMarker]
  );

  return (
    <div className="dashboard-home-page">
      <header className="dashboard-home-filterbar">
        <div className="feed-filters" aria-label="Feed filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`feed-filter ${
                activeFilter === filter.id ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <div className="dashboard-home">
        <section className="dashboard-home-feed">
          <div className="feed-list">
            <Feed activeFilter={activeFilter} />
          </div>
        </section>

        <section className="dashboard-home-map">
          <div className="dashboard-map-search">
            <div className="dashboard-search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder={`Search ${
                  searchMode === "local" ? "your community" : "the world"
                }...`}
              />

              <span className="dashboard-search-icon">⌕</span>
            </div>

            <div className="dashboard-search-mode">
              <button
                type="button"
                className={searchMode === "local" ? "active" : ""}
                onClick={() => setSearchMode("local")}
              >
                Local
              </button>

              <button
                type="button"
                className={searchMode === "global" ? "active" : ""}
                onClick={() => setSearchMode("global")}
              >
                Global
              </button>
            </div>

            {!!searchResults.length && (
              <div className="dashboard-search-results">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className="dashboard-search-result"
                    onClick={() => handleSearchSelect(result)}
                  >
                    <div className="dashboard-search-result-meta">
                      <span>{result.type}</span>
                      <strong>{result.title}</strong>
                    </div>

                    <p>{result.content}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <CommunityMap searchQuery={searchQuery} searchMode={searchMode} />
        </section>
      </div>
    </div>
  );
}