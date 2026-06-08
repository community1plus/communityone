import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { resolveLocation } from "../services/resolveLocation";

const MODE_KEY = "user_location_mode";
const AUTO_CACHE_KEY = "user_auto_location_cache";
const MANUAL_CACHE_KEY = "user_manual_location_cache";

const CACHE_TTL = 1000 * 60 * 10;

const readCache = (key, respectTTL = true) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached?.data) return null;

    if (!respectTTL) return cached.data;

    return Date.now() - cached.timestamp < CACHE_TTL
      ? cached.data
      : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const writeCache = (key, data) => {
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

const buildSuburbLabel = (loc = {}) => {
  const suburb = loc.suburb || loc.city || loc.region;
  const state = loc.state;

  if (suburb && state) return `${suburb}, ${state}`;
  if (suburb) return suburb;
  if (state) return state;

  return loc.label || "Enter location";
};

const buildSafeAutoLocation = (loc) => {
  if (!loc) return null;

  const suburbLabel = buildSuburbLabel(loc);

  const safeLabel =
    loc.hint && loc.suburb
      ? `${loc.hint}, ${loc.suburb}`
      : suburbLabel;

  return {
    ...loc,

    // Keep raw address internally but don't show it as trusted.
    rawLabel: loc.label,
    rawFullAddress: loc.fullAddress,

    label: safeLabel,
    fullAddress: "",

    displayLabel: safeLabel,
    isVerifiedAddress: false,
    isHomeVerificationGrade: false,
  };
};

const buildSafeManualLocation = (loc) => {
  if (!loc) return null;

  return {
    ...loc,
    displayLabel: loc.label || loc.fullAddress || buildSuburbLabel(loc),
    isVerifiedAddress: true,
    isHomeVerificationGrade: true,
  };
};

export function useUserLocation() {
  const initialMode = localStorage.getItem(MODE_KEY) || "auto";

  const [mode, setMode] = useState(initialMode);

  const [autoLocation, setAutoLocation] = useState(() =>
    readCache(AUTO_CACHE_KEY)
  );

  const [manualLocation, setManualLocation] = useState(() =>
    readCache(MANUAL_CACHE_KEY, false)
  );

  const [loading, setLoading] = useState(
    initialMode === "auto" && !readCache(AUTO_CACHE_KEY)
  );

  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const hasFetchedOnLoadRef = useRef(false);

  const safeAutoLocation = useMemo(
    () => buildSafeAutoLocation(autoLocation),
    [autoLocation]
  );

  const safeManualLocation = useMemo(
    () => buildSafeManualLocation(manualLocation),
    [manualLocation]
  );

  const location = useMemo(() => {
    if (mode === "manual") return safeManualLocation;

    return autoLocation;
  }, [mode, safeManualLocation, autoLocation]);

  const displayLocation = useMemo(() => {
    if (mode === "auto") {
      return safeAutoLocation || safeManualLocation;
    }

    return safeManualLocation;
  }, [mode, safeAutoLocation, safeManualLocation]);

  const fetchAutoLocation = useCallback(({ force = false } = {}) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    if (!force) {
      const cachedAuto = readCache(AUTO_CACHE_KEY);

      if (cachedAuto) {
        setAutoLocation(cachedAuto);
        setLoading(false);
        return;
      }
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            accuracyMeters: pos.coords.accuracy,
          };

          const resolved = await resolveLocation(coords);

          if (!resolved) {
            throw new Error("No location returned");
          }

          if (requestId !== requestIdRef.current) return;

          const nextAutoLocation = {
            ...resolved,
            ...coords,
            sourceMode: "auto",
            isVerifiedAddress: false,
            isHomeVerificationGrade: false,
          };

          setAutoLocation(nextAutoLocation);
          writeCache(AUTO_CACHE_KEY, nextAutoLocation);

          console.log("[USER LOCATION] auto:", {
            label: nextAutoLocation.label,
            fullAddress: nextAutoLocation.fullAddress,
            locationType: nextAutoLocation.locationType,
            isRooftop: nextAutoLocation.isRooftop,
            accuracyMeters: nextAutoLocation.accuracyMeters,
            safeDisplay: buildSafeAutoLocation(nextAutoLocation)?.label,
          });
        } catch (err) {
          console.error("Auto location resolve failed:", err);

          if (requestId !== requestIdRef.current) return;

          setError("Location resolution failed");
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        }
      },
      (err) => {
        if (requestId !== requestIdRef.current) return;

        console.error("Geolocation error:", err);
        setError(err.message || "Permission denied");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (hasFetchedOnLoadRef.current) return;

    hasFetchedOnLoadRef.current = true;

    if (mode === "auto") {
      fetchAutoLocation({ force: !autoLocation });
    }
  }, [mode, autoLocation, fetchAutoLocation]);

  const setAutoMode = useCallback(() => {
    requestIdRef.current += 1;

    setMode("auto");
    setLoading(true);
    setError(null);

    fetchAutoLocation({ force: true });
  }, [fetchAutoLocation]);

  const setManualMode = useCallback((nextManualLocation) => {
    requestIdRef.current += 1;

    const normalizedManual = {
      ...nextManualLocation,
      sourceMode: "manual",
      isVerifiedAddress: true,
      isHomeVerificationGrade: true,
    };

    setMode("manual");
    setManualLocation(normalizedManual);
    writeCache(MANUAL_CACHE_KEY, normalizedManual);

    setLoading(false);
    setError(null);
  }, []);

  const refetch = useCallback(() => {
    if (mode !== "auto") {
      setAutoMode();
      return;
    }

    fetchAutoLocation({ force: true });
  }, [mode, setAutoMode, fetchAutoLocation]);

  return {
    location,
    displayLocation,

    autoLocation,
    manualLocation,

    mode,
    loading,
    error,

    setAutoMode,
    setManualMode,
    refetch,

    isAuto: mode === "auto",
    isManual: mode === "manual",
  };
}