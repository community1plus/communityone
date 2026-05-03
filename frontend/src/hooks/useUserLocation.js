import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveLocation } from "../services/resolveLocation";

const MODE_KEY = "user_location_mode";
const AUTO_CACHE_KEY = "user_auto_location_cache";
const MANUAL_CACHE_KEY = "user_manual_location_cache";

const CACHE_TTL = 1000 * 60 * 10;

const readCache = (key, respectTTL = true) => {
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (!cached?.data) return null;

    if (!respectTTL) return cached.data;

    return Date.now() - cached.timestamp < CACHE_TTL ? cached.data : null;
  } catch {
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

  const location = useMemo(() => {
    if (mode === "manual") return manualLocation;

    return autoLocation;
  }, [mode, manualLocation, autoLocation]);

  const displayLocation = useMemo(() => {
    if (mode === "auto") {
      return autoLocation || manualLocation;
    }

    return manualLocation;
  }, [mode, autoLocation, manualLocation]);

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
          };

          const resolved = await resolveLocation(coords);

          if (!resolved) {
            throw new Error("No location returned");
          }

          if (requestId !== requestIdRef.current) return;

          setAutoLocation(resolved);
          writeCache(AUTO_CACHE_KEY, resolved);
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

    setMode("manual");
    setManualLocation(nextManualLocation);
    writeCache(MANUAL_CACHE_KEY, nextManualLocation);

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