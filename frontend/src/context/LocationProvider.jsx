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

const CACHE_TTL = 1000 * 60 * 10;

const buildDisplayLabel = ({ suburb, city, region, state }) => {
  if (suburb && state) return `${suburb}, ${state}`;
  if (city && state) return `${city}, ${state}`;
  if (region && state) return `${region}, ${state}`;
  if (suburb) return suburb;
  if (city) return city;
  if (region) return region;
  if (state) return state;

  return "Enter location";
};

const readStorage = (key, respectTTL = false) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.data) return null;

    if (!respectTTL) return parsed.data;

    return Date.now() - parsed.timestamp < CACHE_TTL
      ? parsed.data
      : null;
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

const resolveAccuracyLevel = ({
  type,
  accuracyMeters,
  locationType,
}) => {
  if (type === "manual") {
    return "MANUAL";
  }

  if (locationType === "ROOFTOP") {
    return "LEVEL_4";
  }

  if (locationType === "RANGE_INTERPOLATED") {
    return "LEVEL_3";
  }

  if (locationType === "GEOMETRIC_CENTER") {
    return "LEVEL_2";
  }

  if (locationType === "APPROXIMATE") {
    return "LEVEL_1";
  }

  if (accuracyMeters && accuracyMeters <= 25) {
    return "LEVEL_4";
  }

  if (accuracyMeters && accuracyMeters <= 100) {
    return "LEVEL_3";
  }

  if (accuracyMeters && accuracyMeters <= 1000) {
    return "LEVEL_2";
  }

  return "LEVEL_1";
};

const normalizeLocation = (loc = {}, fallbackType = "auto") => {
  const lat = loc.lat ?? loc.latitude ?? null;
  const lng = loc.lng ?? loc.longitude ?? null;

  const suburb = loc.suburb || "";
  const city = loc.city || loc.suburb || "";
  const region =
    loc.region ||
    loc.region_code ||
    loc.administrative_area_level_2 ||
    "";

  const state =
    loc.state ||
    loc.administrative_area_level_1 ||
    loc.region_code ||
    "";

  const country = loc.country || "";

  const type = fallbackType;

  const accuracyMeters =
    loc.accuracyMeters ?? loc.accuracy ?? null;

  const locationType =
    loc.locationType ||
    loc.geocodeLocationType ||
    loc.geometry?.location_type ||
    "";

  const precisionSource =
    loc.precisionSource ||
    (locationType ? "reverse_geocode" : "browser_geolocation");

  const isRooftop = locationType === "ROOFTOP";

  const accuracy = resolveAccuracyLevel({
    type,
    accuracyMeters,
    locationType,
  });

  const label =
    loc.label ||
    buildDisplayLabel({
      suburb,
      city,
      region,
      state,
    });

  return {
    lat,
    lng,

    suburb,
    city,
    region,
    state,
    country,

    label,
    fullAddress: loc.fullAddress || loc.formatted_address || "",

    type,

    accuracy,
    accuracyMeters,

    locationType,
    precisionSource,
    isRooftop,

    updatedAt: Date.now(),
  };
};

export function LocationProvider({ children }) {
  const initialMode = localStorage.getItem(MODE_KEY) || "auto";

  const [locationMode, setLocationMode] = useState(initialMode);

  const [autoLocation, setAutoLocation] = useState(() =>
    readStorage(AUTO_LOCATION_KEY, true)
  );

  const [manualLocation, setManualLocationState] = useState(() =>
    readStorage(MANUAL_LOCATION_KEY, false)
  );

  const [locationLoading, setLocationLoading] = useState(
    initialMode === "auto" &&
      !readStorage(AUTO_LOCATION_KEY, true)
  );

  const [locationError, setLocationError] = useState(null);

  const requestIdRef = useRef(0);

  const viewLocation = useMemo(() => {
    if (locationMode === "manual") return manualLocation;
    if (locationMode === "auto") return autoLocation;

    return null;
  }, [locationMode, manualLocation, autoLocation]);

  const displayLocation = useMemo(() => {
    if (locationMode === "manual") return manualLocation;
    if (locationMode === "auto") return autoLocation || manualLocation;

    return null;
  }, [locationMode, autoLocation, manualLocation]);

  const persistMode = useCallback((mode) => {
    localStorage.setItem(MODE_KEY, mode);
    setLocationMode(mode);
  }, []);

  const saveAutoLocation = useCallback((loc) => {
    if (!loc) return null;

    const normalized = normalizeLocation(loc, "auto");

    setAutoLocation(normalized);
    writeStorage(AUTO_LOCATION_KEY, normalized);

    return normalized;
  }, []);

  const setManualLocation = useCallback(
    (loc) => {
      if (!loc) return null;

      requestIdRef.current += 1;

      const normalized = normalizeLocation(loc, "manual");

      persistMode("manual");
      setManualLocationState(normalized);
      writeStorage(MANUAL_LOCATION_KEY, normalized);

      setLocationLoading(false);
      setLocationError(null);

      return normalized;
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
  const MAX_ACCEPTABLE_ACCURACY = 150; // Maximum allowed radius in meters for Wi-Fi

  const options = {
    enableHighAccuracy: true,
    timeout: 20000,           // Increased to 20s to give the Wi-Fi scan enough time
    maximumAge: 0,             // Force a fresh scan
  };

  const handleSuccess = async (pos) => {
    try {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy,
      };

      // 1. Accuracy Threshold Check
      if (coords.accuracyMeters > MAX_ACCEPTABLE_ACCURACY) {
        console.warn(`[LOCATION] Rejected. Accuracy (${coords.accuracyMeters}m) exceeds threshold (${MAX_ACCEPTABLE_ACCURACY}m).`);
        
        // Fallback: If initial precise attempt is too wide, downgrade and try once more
        if (options.enableHighAccuracy) {
          triggerFallback("Location precision too low");
          return;
        }
        throw new Error("Location accuracy insufficient");
      }

      const resolved = await resolveLocation({
        lat: coords.lat,
        lng: coords.lng,
        accuracy: coords.accuracyMeters,
      });

      if (!resolved) {
        throw new Error("No location returned");
      }

      if (requestId !== requestIdRef.current) return;

      const normalized = saveAutoLocation({
        ...resolved,
        ...coords,
      });

      console.log("[LOCATION] resolved:", {
        label: normalized.label,
        fullAddress: normalized.fullAddress,
        accuracy: normalized.accuracy,
        accuracyMeters: normalized.accuracyMeters,
        locationType: normalized.locationType,
        precisionSource: normalized.precisionSource,
        isRooftop: normalized.isRooftop,
      });

      resolve(normalized);
    } catch (err) {
      console.error("Auto location failed:", err);

      if (requestId !== requestIdRef.current) return;

      setLocationError(err.message || "Location resolution failed");
      resolve(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLocationLoading(false);
      }
    }
  };

  const triggerFallback = (reason) => {
    console.warn(`${reason}. Retrying with standard options...`);
    options.enableHighAccuracy = false;
    options.timeout = 10000; // 10 seconds for standard network/IP fallback
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  };

  const handleError = (err) => {
    // 2. Timeout Fallback
    if (err.code === 3 && options.enableHighAccuracy) {
      triggerFallback("High accuracy timed out");
      return;
    }

    if (requestId !== requestIdRef.current) return;

    console.warn("Geolocation unavailable:", err);
    setLocationError(err.message || "Permission denied");
    setLocationLoading(false);
    resolve(null);
  };

  // Initial high-accuracy attempt
  navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
});
}, [persistMode, saveAutoLocation]);

  useEffect(() => {
    if (locationMode !== "auto") return;

    const cachedAuto = readStorage(AUTO_LOCATION_KEY, true);

    if (cachedAuto) {
      saveAutoLocation(cachedAuto);
      setLocationLoading(false);
      return;
    }

    useAutoLocation();
  }, [locationMode, saveAutoLocation, useAutoLocation]);

  const resetManualLocation = useCallback(() => {
    localStorage.removeItem(MANUAL_LOCATION_KEY);
    setManualLocationState(null);
    useAutoLocation();
  }, [useAutoLocation]);

  const setViewLocation = useCallback(
    (loc, mode = "manual") => {
      if (mode === "manual") return setManualLocation(loc);

      persistMode("auto");
      return saveAutoLocation(loc);
    },
    [setManualLocation, persistMode, saveAutoLocation]
  );

  const value = useMemo(
    () => ({
      viewLocation,
      displayLocation,

      locationMode,
      locationLoading,
      locationError,

      autoLocation,
      manualLocation,

      setManualLocation,
      useAutoLocation,
      resetManualLocation,

      setViewLocation,
      enableLiveLocation: useAutoLocation,
      enableHomeLocation: useAutoLocation,

      homeLocation: null,
      liveLocation: autoLocation,
      ipLocation: null,
    }),
    [
      viewLocation,
      displayLocation,
      locationMode,
      locationLoading,
      locationError,
      autoLocation,
      manualLocation,
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