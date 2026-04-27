import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const MapContext = createContext();

export function MapProvider({ children }) {
  /* =========================
     CORE STATE
  ========================= */

  const [markers, setMarkers] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [filters, setFilters] = useState(null);
  const [bounds, setBounds] = useState(null); // 🔥 NEW (critical)

  /* =========================
     DERIVED: FILTERED
  ========================= */

  const filteredMarkers = useMemo(() => {
    if (!filters) return markers;

    return markers.filter((m) => {
      if (filters.type && m.type !== filters.type) return false;
      return true;
    });
  }, [markers, filters]);

  /* =========================
     DERIVED: VIEWPORT (CORE)
  ========================= */

  const visibleMarkers = useMemo(() => {
    if (!bounds) return filteredMarkers;

    return filteredMarkers.filter((m) => {
      const pos = m.location;
      return pos && bounds.contains(pos);
    });
  }, [filteredMarkers, bounds]);

  /* =========================
     DERIVED: SELECTION
  ========================= */

  const selectedMarker = useMemo(() => {
    if (!selectedMarkerId) return null;
    return markers.find((m) => m.id === selectedMarkerId) || null;
  }, [selectedMarkerId, markers]);

  const selectedLocation = useMemo(() => {
    return selectedMarker?.location || null;
  }, [selectedMarker]);

  const getMarkerById = useCallback(
    (id) => markers.find((m) => m.id === id),
    [markers]
  );

  /* =========================
     ACTIONS
  ========================= */

  const focusOnMarker = useCallback((location, id) => {
    if (!location) return;

    setSelectedMarkerId(id || null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMarkerId(null);
  }, []);

  /* =========================
     INGESTION (IMPORTANT)
  ========================= */

  const addMarkers = useCallback((incoming, source = "unknown") => {
    if (!Array.isArray(incoming)) return;

    setMarkers((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));

      const newItems = incoming
        .filter((item) => item?.id && !existingIds.has(item.id))
        .map((item) => ({
          ...item,
          __source: item.__source || source,
        }));

      return [...prev, ...newItems];
    });
  }, []);

  const replaceMarkers = useCallback((incoming = []) => {
    setMarkers(incoming);
  }, []);

  /* =========================
     VALUE
  ========================= */

  const value = {
    /* state */
    markers,
    filteredMarkers,
    visibleMarkers,

    selectedMarkerId,
    selectedMarker,
    selectedLocation,

    bounds,

    filters,

    /* actions */
    setMarkers,          // keep for flexibility
    addMarkers,          // ✅ preferred
    replaceMarkers,

    setBounds,

    setSelectedMarkerId,
    clearSelection,

    focusOnMarker,

    getMarkerById,

    setFilters,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
  return useContext(MapContext);
}