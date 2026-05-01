import { useEffect, useState, useRef, useCallback } from "react";
import { resolveLocation } from "../services/resolveLocation";

const CACHE_KEY = "user_location_cache";
const CACHE_TTL = 1000 * 60 * 10;

export function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  const fetchLocation = useCallback(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    /* CACHE */
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setLocation(cached.data);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Cache read failed", e);
    }

    /* GEO */
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

          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data: resolved,
              timestamp: Date.now(),
            })
          );
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
      }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  /* SAFE REFETCH */
  const refetch = () => {
    hasFetched.current = false;
    setLoading(true);
    setError(null);
    fetchLocation();
  };

  return {
    location,
    loading,
    error,
    refetch,
  };
}