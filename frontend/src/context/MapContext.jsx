import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const MapContext = createContext();

export function MapProvider({ children }) {
  /* =====================================================
     CORE STATE
  ===================================================== */

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [markers, setMarkers] = useState([]);

  /* 🔥 SYSTEM STATE */
  const [mode, setMode] = useState("NOW");        // WHAT
  const [scope, setScope] = useState("LOCAL");    // WHERE
  const [category, setCategory] = useState(null); // WHICH

  /* 🔥 NEW: USER LOCATION (for proximity) */
  const [userLocation, setUserLocation] = useState(null);

  /* =====================================================
     ACTIONS
  ===================================================== */

  const focusLocation = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const setMapMarkers = useCallback((list) => {
    setMarkers(list || []);
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
     FILTER CONFIG (🔥 scalable)
  ===================================================== */

  const MODE_FILTERS = useMemo(
    () => ({
      NOW: ["incident", "alert", "request"],
      BLOB: ["post", "event", "feature"],
    }),
    []
  );

  /* =====================================================
     DERIVED STATE (🔥 CORE ENGINE)
  ===================================================== */

  const filteredMarkers = useMemo(() => {
    if (!markers.length) return [];

    let result = markers;

    /* =========================
       MODE (WHAT)
    ========================= */

    const allowedTypes = MODE_FILTERS[mode];
    if (allowedTypes) {
      result = result.filter((m) => allowedTypes.includes(m.type));
    }

    /* =========================
       CATEGORY (WHICH)
    ========================= */

    if (category) {
      result = result.filter((m) => m.type === category);
    }

    /* =========================
       SCOPE (WHERE)
    ========================= */

    if (scope === "LOCAL") {
      result = result.filter((m) => m.isLocal !== false);
    }

    /* =========================
       SORT BY PROXIMITY (🔥 optional prep)
    ========================= */

    if (userLocation) {
      result = result.map((m) => ({
        ...m,
        distance: getDistance(userLocation, m),
      }));
    }

    return result;
  }, [markers, mode, scope, category, userLocation, MODE_FILTERS]);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = useMemo(
    () => ({
      /* state */
      selectedLocation,
      markers,
      filteredMarkers,

      mode,
      scope,
      category,
      userLocation,

      /* actions */
      setMode,
      setScope,
      setCategory,
      updateUserLocation,

      focusLocation,
      setMapMarkers,
      clearSelection,
      clearFilters,
    }),
    [
      selectedLocation,
      markers,
      filteredMarkers,
      mode,
      scope,
      category,
      userLocation,
      focusLocation,
      setMapMarkers,
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
   UTILS (local, lightweight)
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
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * y; // meters
}