import { useEffect, useState } from "react";
import { resolveLocation } from "../services/resolveLocation";

/* ===============================
   CONFIG
=============================== */

const CACHE_KEY = "user_location_cache";
const CACHE_TTL = 1000 * 60 * 10; // 10 mins

/* ===============================
   GLOBAL STATE (🔥 KEY FIX)
=============================== */

// persists across re-renders + remounts
let locationPromise = null;
let resolvedCache = null;

/* ===============================
   HELPERS
=============================== */

const loadCache = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  } catch {}
  return null;
};

const saveCache = (data) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {}
};

/* ===============================
   CORE FETCH (DEDUPED)
=============================== */

const fetchLocation = async () => {
  // 1. in-memory cache
  if (resolvedCache) return resolvedCache;

  // 2. localStorage cache
  const cached = loadCache();
  if (cached) {
    resolvedCache = cached;
    return cached;
  }

  // 3. dedupe concurrent calls
  if (locationPromise) return locationPromise;

  locationPromise = new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
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

          resolvedCache = resolved;
          saveCache(resolved);

          resolve(resolved);
        } catch (err) {
          reject(err);
        }
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });

  return locationPromise;
};

/* ===============================
   HOOK
=============================== */

export function useUserLocation() {
  const [location, setLocation] = useState(resolvedCache || null);
  const [loading, setLoading] = useState(!resolvedCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetchLocation()
      .then((loc) => {
        if (mounted) {
          setLocation(loc);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error("Location error:", err);
          setError(err.message || "Location failed");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    location,
    loading,
    error,
    hasLocation: !!location,
  };
}