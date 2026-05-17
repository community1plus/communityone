import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./CommunityPlusDashboardHome.css";

import { useMap } from "../../context/MapContext";

import CommunityMap from "../../components/Map/CommunityMap";

import FeedCard from "../../components/FeedCard/CommunityPlusFeedCard";

/* =========================================================
   MOCK FEED
========================================================= */

const FEED_ITEMS = [
  {
    id: 1,
    type: "incident",
    title: "🚨 Incident reported nearby",
    content: "Incident reported nearby.",
    author: "Community One",
    created_at: "2026-05-12T08:00:00.000Z",
    expires_at: "2026-05-13T08:00:00.000Z",
    location: {
      lat: -37.8136,
      lng: 144.9631,
    },
  },

  {
    id: 2,
    type: "event",
    title: "📅 Community event tonight",
    content: "Community event tonight.",
    author: "Community One",
    created_at: "2026-05-11T08:00:00.000Z",
    expires_at: null,
    location: {
      lat: -37.81,
      lng: 144.97,
    },
  },

  {
    id: 3,
    type: "beacon",
    title: "📡 Beacon alert triggered",
    content: "Beacon alert triggered.",
    author: "Community One",
    created_at: "2026-05-10T08:00:00.000Z",
    expires_at: "2026-05-11T08:00:00.000Z",
    location: {
      lat: -37.82,
      lng: 144.95,
    },
  },

  {
    id: 4,
    type: "blob",
    title: "🛍️ Local business promotion",
    content: "Local business promotion.",
    author: "Community One",
    created_at: "2026-05-09T08:00:00.000Z",
    expires_at: null,
    location: {
      lat: -37.815,
      lng: 144.98,
    },
  },
];

/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "now", label: "Now" },
  { id: "blob", label: "Blobs" },
  { id: "incident", label: "Incidents" },
  { id: "event", label: "Events" },
  { id: "beacon", label: "Beacons" },
];

/* =========================================================
   HELPERS
========================================================= */

function formatRelativeTime(value) {

  if (!value) return "Just now";

  const now = Date.now();

  const then =
    new Date(value).getTime();

  const diff =
    Math.floor((now - then) / 60000);

  if (diff < 1) {
    return "Just now";
  }

  if (diff < 60) {
    return `${diff}m ago`;
  }

  if (diff < 1440) {
    return `${Math.floor(diff / 60)}h ago`;
  }

  return `${Math.floor(diff / 1440)}d ago`;

}

/* =========================================================
   MAIN
========================================================= */

export default function CommunityPlusDashboardHome() {

  const {
    addMarkers,
    focusOnMarker,
    visibleMarkers,
    selectedMarkerId,
    clearSelection,
  } = useMap();

  /* =======================================================
     STATE
  ======================================================= */

  const [
    activeFilter,
    setActiveFilter,
  ] = useState("all");

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    searchMode,
    setSearchMode,
  ] = useState("local");

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    canScrollLeft,
    setCanScrollLeft,
  ] = useState(false);

  const [
    canScrollRight,
    setCanScrollRight,
  ] = useState(true);

  /* =======================================================
     REFS
  ======================================================= */

  const filterRailRef =
    useRef(null);

  /* =======================================================
     FILTERED FEED
  ======================================================= */

  const filteredFeed =
    useMemo(() => {

      if (activeFilter === "all") {
        return FEED_ITEMS;
      }

      if (activeFilter === "now") {

        return FEED_ITEMS.filter(
          (item) =>
            [
              "incident",
              "event",
              "beacon",
            ].includes(item.type)
        );

      }

      return FEED_ITEMS.filter(
        (item) =>
          item.type === activeFilter
      );

    }, [activeFilter]);

  /* =======================================================
     MAP MARKERS
  ======================================================= */

  useEffect(() => {

    addMarkers(
      filteredFeed,
      "feed"
    );

  }, [
    filteredFeed,
    addMarkers,
  ]);

  /* =======================================================
     RAIL STATE
  ======================================================= */

  const updateRailState =
    useCallback(() => {

      if (!filterRailRef.current) {
        return;
      }

      const rail =
        filterRailRef.current;

      setCanScrollLeft(
        rail.scrollLeft > 4
      );

      setCanScrollRight(
        rail.scrollLeft <
          rail.scrollWidth -
            rail.clientWidth -
            4
      );

    }, []);

  useEffect(() => {

    updateRailState();

    const rail =
      filterRailRef.current;

    if (!rail) return;

    rail.addEventListener(
      "scroll",
      updateRailState
    );

    return () => {

      rail.removeEventListener(
        "scroll",
        updateRailState
      );

    };

  }, [updateRailState]);

  /* =======================================================
     FILTER SHIFT
  ======================================================= */

  const shiftFiltersLeft =
    useCallback(() => {

      filterRailRef.current?.scrollBy({
        left: -220,
        behavior: "smooth",
      });

    }, []);

  const shiftFiltersRight =
    useCallback(() => {

      filterRailRef.current?.scrollBy({
        left: 220,
        behavior: "smooth",
      });

    }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch =
    useCallback((event) => {

      const value =
        event.target.value;

      setSearchQuery(value);

      if (!value.trim()) {

        setSearchResults([]);

        return;
      }

      const results =
        FEED_ITEMS.filter((item) => {

          const haystack =
            `
              ${item.title}
              ${item.content}
              ${item.type}
            `.toLowerCase();

          return haystack.includes(
            value.toLowerCase()
          );

        });

      setSearchResults(results);

    }, []);

  /* =======================================================
     SEARCH SELECT
  ======================================================= */

  const handleSearchSelect =
    useCallback(
      (item) => {

        if (!item?.location) {
          return;
        }

        focusOnMarker(
          item.location,
          item.id
        );

        setSearchQuery(
          item.title
        );

        setSearchResults([]);

      },
      [focusOnMarker]
    );

  /* =======================================================
     FEED SELECT
  ======================================================= */

  const handleFeedSelect =
    useCallback(
      ({ id, location }) => {

        if (!location) return;

        focusOnMarker(
          location,
          id
        );

      },
      [focusOnMarker]
    );

  /* =======================================================
     ECHO
  ======================================================= */

  const handleEchoClick =
    useCallback(() => {

      console.log(
        "Echo activated"
      );

    }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="dashboard-home-page">

      <div className="dashboard-home">

        {/* =================================================
            FEED PANEL
        ================================================== */}

        <section className="dashboard-home-feed">

          {/* =============================================
              FILTER RAIL
          ============================================== */}

          <div className="feed-filters-wrapper">

            {canScrollLeft && (

              <button
                type="button"
                className="filter-shift left"
                onClick={
                  shiftFiltersLeft
                }
              >
                ←
              </button>

            )}

            <div
              ref={filterRailRef}
              className="feed-filters"
            >

              {FILTERS.map((filter) => (

                <button
                  key={filter.id}
                  type="button"
                  className={`feed-filter ${
                    activeFilter ===
                    filter.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveFilter(
                      filter.id
                    )
                  }
                >

                  {filter.label}

                </button>

              ))}

            </div>

            {canScrollRight && (

              <button
                type="button"
                className="filter-shift right"
                onClick={
                  shiftFiltersRight
                }
              >
                →
              </button>

            )}

          </div>

          {/* =============================================
              FEED LIST
          ============================================== */}

          <div className="feed-list">

            {filteredFeed.map((item) => (

              <div
                key={item.id}
                onMouseLeave={() => {

                  if (
                    selectedMarkerId !==
                    item.id
                  ) {
                    clearSelection();
                  }

                }}
              >

                <FeedCard
                  id={item.id}
                  type={item.type}
                  name={item.author}
                  text={
                    item.content
                  }
                  time={formatRelativeTime(
                    item.created_at
                  )}
                  location={
                    item.location
                  }
                  active={
                    selectedMarkerId ===
                    item.id
                  }
                  onSelect={
                    handleFeedSelect
                  }
                />

              </div>

            ))}

          </div>

        </section>

        {/* =================================================
            MAP PANEL
        ================================================== */}

        <section className="dashboard-home-map">

          {/* =============================================
              TOP TOOLBAR
          ============================================== */}

          <div className="dashboard-map-toolbar">

            <div className="dashboard-search-controls">

              {/* SEARCH */}

              <div className="dashboard-search-box">

                <input
                  type="text"
                  value={searchQuery}
                  onChange={
                    handleSearch
                  }
                  placeholder={`Search ${
                    searchMode ===
                    "local"
                      ? "your community"
                      : "the world"
                  }...`}
                />

                <span className="dashboard-search-icon">
                  ⌕
                </span>

                {!!searchResults.length && (

                  <div className="dashboard-search-results">

                    {searchResults.map(
                      (item) => (

                        <button
                          key={item.id}
                          type="button"
                          className="dashboard-search-result"
                          onClick={() =>
                            handleSearchSelect(
                              item
                            )
                          }
                        >

                          <div className="dashboard-search-result-meta">

                            <span>
                              {item.type}
                            </span>

                            <strong>
                              {item.title}
                            </strong>

                          </div>

                          <p>
                            {item.content}
                          </p>

                        </button>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* MODE */}

              <div className="dashboard-search-mode">

                <button
                  type="button"
                  className={
                    searchMode ===
                    "local"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSearchMode(
                      "local"
                    )
                  }
                >
                  Local
                </button>

                <button
                  type="button"
                  className={
                    searchMode ===
                    "global"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSearchMode(
                      "global"
                    )
                  }
                >
                  Global
                </button>

              </div>

            </div>

          </div>

          {/* =============================================
              MAP
          ============================================== */}

          <div className="dashboard-map-canvas">

            <CommunityMap
              searchQuery={
                searchQuery
              }
              searchMode={
                searchMode
              }
            />

          </div>

          {/* =============================================
              ECHO ORB
          ============================================== */}

        </section>

      </div>

    </div>

  );

}