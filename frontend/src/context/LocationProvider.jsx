import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { resolveLocation } from "../services/resolveLocation";

const LocationContext = createContext(null);

export const useLocationContext = () => useContext(LocationContext);

const MODE_KEY = "communityplus_location_mode";
const AUTO_LOCATION_KEY = "communityplus_auto_location";
const MANUAL_LOCATION_KEY = "communityplus_manual_location";
const VIEW_LOCATION_KEY = "communityplus_view_location";

const CACHE_TTL = 1000 * 60 * 10;

const readStorage = (key, respectTTL = false) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed?.data) return null;

    if (!respectTTL) return parsed.data;

    return Date.now() - parsed.timestamp < CACHE_TTL ? parsed.data : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const writeStorage = (key, data) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {
    // ignore storage failure
  }
};

const normalizeLocation = (loc = {}, fallbackType = "auto") => {
  const lat = loc.lat ?? loc.latitude ?? null;
  const lng = loc.lng ?? loc.longitude ?? null;

  const suburb = loc.suburb || loc.city || "";
  const city = loc.city || loc.suburb || "";
  const state = loc.state || loc.region || loc.region_code || "";

  const type = loc.type || fallbackType;
  const accuracyMeters = loc.accuracyMeters ?? loc.accuracy ?? null;

  const label =
    loc.label ||
    [suburb || city, state].filter(Boolean).join(", ") ||
    "Enter location";

  return {
    lat,
    lng,
    suburb,
    city,
    state,
    label,
    type,
    accuracyMeters,
    accuracy:
      type === "manual"
        ? "MANUAL"
        : accuracyMeters && accuracyMeters <= 100
        ? "LEVEL_4"
        : "LEVEL_3",
    updatedAt: Date.now(),
  };
};

export function LocationProvider({ children }) {
  const initialMode = localStorage.getItem(MODE_KEY) || "auto";

  const [locationMode, setLocationMode] = useState(initialMode);

  const [autoLocation, setAutoLocation] = useState(() =>
    readStorage(AUTO_LOCATION_KEY, true)
  );

  const [manualLocationState, setManualLocationState] = useState(() =>
    readStorage(MANUAL_LOCATION_KEY, false)
  );

  const [viewLocation, setViewLocationState] = useState(() =>
    readStorage(VIEW_LOCATION_KEY, false)
  );

  const [locationLoading, setLocationLoading] = useState(
    initialMode === "auto" && !readStorage(AUTO_LOCATION_KEY, true)
  );

  const [locationError, setLocationError] = useState(null);

  const requestIdRef = useRef(0);

  const persistMode = useCallback((mode) => {
    localStorage.setItem(MODE_KEY, mode);
    setLocationMode(mode);
  }, []);

  const setAutoLocationSafe = useCallback((loc) => {
    if (!loc) return;

    const normalized = normalizeLocation(loc, "auto");

    setAutoLocation(normalized);
    setViewLocationState(normalized);

    writeStorage(AUTO_LOCATION_KEY, normalized);
    writeStorage(VIEW_LOCATION_KEY, normalized);
  }, []);

  const setManualLocation = useCallback(
    (loc) => {
      if (!loc) return;

      requestIdRef.current += 1;

      const normalized = normalizeLocation(loc, "manual");

      persistMode("manual");

      setManualLocationState(normalized);
      setViewLocationState(normalized);

      writeStorage(MANUAL_LOCATION_KEY, normalized);
      writeStorage(VIEW_LOCATION_KEY, normalized);

      setLocationLoading(false);
      setLocationError(null);
    },
    [persistMode]
  );

  const useAutoLocation = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    persistMode("auto");
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setLocationLoading(false);
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };

            const resolved = await resolveLocation(coords);

            if (!resolved) {
              throw new Error("No location returned");
            }

            if (requestId !== requestIdRef.current) return;

            const normalized = normalizeLocation(
              {
                ...resolved,
                lat: coords.lat,
                lng: coords.lng,
                accuracyMeters: coords.accuracy,
                type: "auto",
              },
              "auto"
            );

            setAutoLocationSafe(normalized);
            resolve(normalized);
          } catch (err) {
            console.error("Auto location failed:", err);

            if (requestId !== requestIdRef.current) return;

            setLocationError("Location resolution failed");
            resolve(null);
          } finally {
            if (requestId === requestIdRef.current) {
              setLocationLoading(false);
            }
          }
        },
        (err) => {
          if (requestId !== requestIdRef.current) return;

          console.warn("Geolocation unavailable:", err);

          setLocationError(err.message || "Permission denied");
          setLocationLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [persistMode, setAutoLocationSafe]);

  useEffect(() => {
    if (locationMode !== "auto") return;

    const cachedAuto = readStorage(AUTO_LOCATION_KEY, true);

    if (cachedAuto) {
      const normalized = normalizeLocation(cachedAuto, "auto");
      setAutoLocation(normalized);
      setViewLocationState(normalized);
      setLocationLoading(false);
      return;
    }

    useAutoLocation();
  }, [locationMode, useAutoLocation]);

  const resetManualLocation = useCallback(() => {
    localStorage.removeItem(MANUAL_LOCATION_KEY);
    setManualLocationState(null);
    useAutoLocation();
  }, [useAutoLocation]);

  const setViewLocation = useCallback(
    (loc, mode = "manual") => {
      if (mode === "manual") {
        setManualLocation(loc);
        return;
      }

      persistMode("auto");
      setAutoLocationSafe(loc);
    },
    [setManualLocation, persistMode, setAutoLocationSafe]
  );

  const value = useMemo(
    () => ({
      viewLocation,

      locationMode,
      locationLoading,
      locationError,

      autoLocation,
      manualLocation: manualLocationState,

      setManualLocation,
      useAutoLocation,
      resetManualLocation,

      // backwards compatibility
      setViewLocation,
      enableLiveLocation: useAutoLocation,
      enableHomeLocation: useAutoLocation,
      homeLocation: null,
      liveLocation: autoLocation,
      ipLocation: null,
    }),
    [
      viewLocation,
      locationMode,
      locationLoading,
      locationError,
      autoLocation,
      manualLocationState,
      setManualLocation,
      useAutoLocation,
      resetManualLocation,
      setViewLocation,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}