import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const MapContext = createContext();

/* =====================================================
   CONFIG
===================================================== */

const DEFAULT_SOURCE_PRIORITY = [
  "alerts",
  "feed",
  "search",
  "yellowpages",
];

/* =====================================================
   PROVIDER
===================================================== */

export function MapProvider({ children }) {
  /* =====================================================
     CORE STATE
  ===================================================== */

  const [selectedLocation, setSelectedLocation] = useState(null);

  // 🔥 NEW: MULTI-SOURCE MARKERS
  const [markersBySource, setMarkersBySource] = useState({});

  // 🔥 ACTIVE SOURCE (optional control layer)
  const [activeSource, setActiveSource] = useState(null);

  /* 🔥 SYSTEM STATE */
  const [mode, setMode] = useState("NOW");
  const [scope, setScope] = useState("LOCAL");
  const [category, setCategory] = useState(null);

  /* 🔥 USER LOCATION */
  const [userLocation, setUserLocation] = useState(null);

  /* =====================================================
     ACTIONS
  ===================================================== */

  const focusLocation = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  /**
   * 🔥 MULTI-SOURCE MARKER SETTER
   */
  const setMapMarkers = useCallback((list, source = "unknown") => {
    setMarkersBySource((prev) => ({
      ...prev,
      [source]: list || [],
    }));
  }, []);

  /**
   * 🔥 CLEAR ONE SOURCE
   */
  const clearSource = useCallback((source) => {
    setMarkersBySource((prev) => {
      const next = { ...prev };
      delete next[source];
      return next;
    });
  }, []);

  /**
   * 🔥 CLEAR ALL
   */
  const clearAllMarkers = useCallback(() => {
    setMarkersBySource({});
  }, []);

  const updateUserLocation = useCallback((coords) => {
    setUserLocation(coords);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const clearFilters = useCallback(() => {
    setCategory(null);
  }, []);

  /* =====================================================
     FILTER CONFIG
  ===================================================== */

  const MODE_FILTERS = useMemo(
    () => ({
      NOW: ["incident", "alert", "request"],
      BLOB: ["post", "event", "feature"],
    }),
    []
  );

  /* =====================================================
     DERIVED: MERGED MARKERS
  ===================================================== */

  const mergedMarkers = useMemo(() => {
    let sources = Object.keys(markersBySource);

    // 🔥 If activeSource is set → isolate it
    if (activeSource) {
      sources = sources.filter((s) => s === activeSource);
    }

    // 🔥 Apply priority ordering
    sources.sort(
      (a, b) =>
        DEFAULT_SOURCE_PRIORITY.indexOf(a) -
        DEFAULT_SOURCE_PRIORITY.indexOf(b)
    );

    // 🔥 Merge all sources
    return sources.flatMap((source) =>
      (markersBySource[source] || []).map((m) => ({
        ...m,
        __source: source,
      }))
    );
  }, [markersBySource, activeSource]);

  /* =====================================================
     DERIVED: FILTERED MARKERS
  ===================================================== */

  const filteredMarkers = useMemo(() => {
    if (!mergedMarkers.length) return [];

    let result = mergedMarkers;

    /* MODE */
    const allowedTypes = MODE_FILTERS[mode];
    if (allowedTypes) {
      result = result.filter((m) => allowedTypes.includes(m.type));
    }

    /* CATEGORY */
    if (category) {
      result = result.filter((m) => m.type === category);
    }

    /* SCOPE */
    if (scope === "LOCAL") {
      result = result.filter((m) => m.isLocal !== false);
    }

    /* PROXIMITY */
    if (userLocation) {
      result = result.map((m) => ({
        ...m,
        distance: getDistance(userLocation, m.location || m),
      }));
    }

    return result;
  }, [mergedMarkers, mode, scope, category, userLocation, MODE_FILTERS]);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = useMemo(
    () => ({
      /* state */
      selectedLocation,
      markersBySource,
      mergedMarkers,
      filteredMarkers,
      activeSource,

      mode,
      scope,
      category,
      userLocation,

      /* actions */
      setMode,
      setScope,
      setCategory,
      setActiveSource,
      updateUserLocation,

      focusLocation,
      setMapMarkers,
      clearSource,
      clearAllMarkers,
      clearSelection,
      clearFilters,
    }),
    [
      selectedLocation,
      markersBySource,
      mergedMarkers,
      filteredMarkers,
      activeSource,
      mode,
      scope,
      category,
      userLocation,
      focusLocation,
      setMapMarkers,
      clearSource,
      clearAllMarkers,
      clearSelection,
      clearFilters,
      updateUserLocation,
    ]
  );

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export const useMap = () => {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMap must be used within MapProvider");
  }

  return context;
};

/* =====================================================
   UTILS
===================================================== */

function getDistance(a, b) {
  if (!a || !b?.lat || !b?.lng) return null;

  const R = 6371e3;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;

  const x =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * y;
}