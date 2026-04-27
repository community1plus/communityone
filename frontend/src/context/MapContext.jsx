// context/MapContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from "react";

const MapContext = createContext();

export function MapProvider({ children }) {
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [focusLocation, setFocusLocation] = useState(null);
  const [filters, setFilters] = useState(null);

  /* =========================
     DERIVED DATA
  ========================= */

  const filteredMarkers = useMemo(() => {
    if (!filters) return markers;

    return markers.filter((m) => {
      if (filters.type && m.type !== filters.type) return false;
      return true;
    });
  }, [markers, filters]);

  const selectedLocation = useMemo(() => {
    if (!selectedMarkerId) return null;
    const marker = markers.find((m) => m.id === selectedMarkerId);
    return marker?.location || null;
  }, [selectedMarkerId, markers]);

  const getMarkerById = useCallback(
    (id) => markers.find((m) => m.id === id),
    [markers]
  );

  /* =========================
     ACTIONS
  ========================= */

  const focusOnMarker = useCallback((location, id) => {
    setSelectedMarkerId(id);
    setFocusLocation(location);
  }, []);

  const value = {
    markers,
    setMarkers,

    filteredMarkers,

    selectedMarkerId,
    setSelectedMarkerId,

    selectedLocation,

    focusLocation,
    focusOnMarker,

    getMarkerById,

    filters,
    setFilters,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
  return useContext(MapContext);
}