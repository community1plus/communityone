import { useEffect, useState, useRef } from "react";
import { resolveLocation } from "../utils/resolveLocation";

/* ===============================
   CONFIG
=============================== */

const CACHE_KEY = "user_location_cache";
const CACHE_TTL = 1000 * 60 * 10; // 10 mins

/* ===============================
   HOOK
=============================== */

export function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    /* ===============================
       1. TRY CACHE FIRST
    =============================== */

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

    /* ===============================
       2. GEOLOCATION
    =============================== */

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

          setLocation(resolved);

          /* ===============================
             CACHE RESULT
          =============================== */

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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  return {
    location,
    loading,
    error,
    hasLocation: !!location,
  };
}