import {
createContext,
useContext,
useState,
useCallback,
useMemo,
} from "react";

import { resolveLocation } from "../services/resolveLocation";

const MapContext = createContext();

export function MapProvider({ children }) {
/* =========================
CORE STATE
========================= */

const [markers, setMarkers] = useState([]);
const [selectedMarkerId, setSelectedMarkerId] = useState(null);
const [filters, setFilters] = useState(null);
const [bounds, setBounds] = useState(null);

/* =========================
USER LOCATION
========================= */

const [userLocation, setUserLocation] = useState(null);
const [resolvedLocation, setResolvedLocation] = useState(null);

// 🔥 derived guard (no extra state needed)
const hasResolvedLocation = !!resolvedLocation;

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
DERIVED: VIEWPORT
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
USER LOCATION PIPELINE
========================= */

const updateUserLocation = useCallback(
async (coords) => {
if (!coords) return;

  // 🔥 always update raw coords
  setUserLocation(coords);

  // 🔥 resolve only once
  if (resolvedLocation) return;

  try {
    const location = await resolveLocation(coords);
    setResolvedLocation(location);
  } catch (err) {
    console.error("❌ Location resolution failed:", err);
  }
},
[resolvedLocation]


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
INGESTION
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

const value = useMemo(
() => ({
/* state */
markers,
filteredMarkers,
visibleMarkers,

  selectedMarkerId,
  selectedMarker,
  selectedLocation,

  bounds,
  filters,

  userLocation,
  resolvedLocation,
  hasResolvedLocation,

  /* actions */
  setMarkers,
  addMarkers,
  replaceMarkers,

  setBounds,

  setSelectedMarkerId,
  clearSelection,

  focusOnMarker,

  getMarkerById,

  setFilters,

  updateUserLocation,
}),
[
  markers,
  filteredMarkers,
  visibleMarkers,
  selectedMarkerId,
  selectedMarker,
  selectedLocation,
  bounds,
  filters,
  userLocation,
  resolvedLocation,
  hasResolvedLocation,
]

);

return (
<MapContext.Provider value={value}>
{children}
</MapContext.Provider>
);
}

export function useMap() {
const context = useContext(MapContext);

if (!context) {
throw new Error("useMap must be used within MapProvider");
}

return context;
}
