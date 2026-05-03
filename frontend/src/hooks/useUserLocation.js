import { useEffect, useState, useRef, useCallback } from "react";
import { resolveLocation } from "../services/resolveLocation";

const CACHE_KEY = "user_location_cache";
const MODE_KEY = "user_location_mode";
const CACHE_TTL = 1000 * 60 * 10;

export function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [mode, setMode] = useState(
    () => localStorage.getItem(MODE_KEY) || "auto"
  );
  const [loading, setLoading] = useState(mode === "auto");
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  const readCache = useCallback(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));

      if (!cached) return null;

      const isFresh = Date.now() - cached.timestamp < CACHE_TTL;

      return isFresh ? cached.data : null;
    } catch (err) {
      console.warn("Location cache read failed", err);
      return null;
    }
  }, []);

  const writeCache = useCallback((data) => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.warn("Location cache write failed", err);
    }
  }, []);

  const fetchAutoLocation = useCallback(
    ({ force = false } = {}) => {
      if (hasFetched.current && !force) return;

      hasFetched.current = true;
      setLoading(true);
      setError(null);

      if (!force) {
        const cached = readCache();

        if (cached) {
          setLocation(cached);
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

            setLocation(resolved);
            writeCache(resolved);
          } catch (err) {
            console.error("Resolve failed:", err);
            setError("Location resolution failed");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
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
    },
    [readCache, writeCache]
  );

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);

    if (mode === "auto") {
      fetchAutoLocation();
    } else {
      setLoading(false);
    }
  }, [mode, fetchAutoLocation]);

  const setAutoMode = useCallback(() => {
    setMode("auto");
    hasFetched.current = false;
    fetchAutoLocation({ force: true });
  }, [fetchAutoLocation]);

  const setManualMode = useCallback((manualLocation) => {
    setMode("manual");
    setLocation(manualLocation);
    setLoading(false);
    setError(null);
  }, []);

  const refetch = useCallback(() => {
    hasFetched.current = false;
    fetchAutoLocation({ force: true });
  }, [fetchAutoLocation]);

  return {
    location,
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