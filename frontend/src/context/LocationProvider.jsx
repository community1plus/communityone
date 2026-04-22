import React, { createContext, useContext, useEffect, useState } from "react";
import { resolveLocation } from "../services/resolveLocation";

const LocationContext = createContext();
export const useLocationContext = () => useContext(LocationContext);

export function LocationProvider({ children }) {
  /* ===============================
     STATE
  =============================== */

  const [homeLocation, setHomeLocation] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);

  // 🔥 FIX: prevent restoring IP as active location
  const [viewLocation, setViewLocationState] = useState(() => {
    const saved = localStorage.getItem("viewLocation");

    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);

      // 🚨 BLOCK IP RESTORE
      if (parsed?.type === "ip") {
        console.log("🚫 Ignoring stored IP location");
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  });

  const [manualLocation, setManualLocation] = useState(null);
  const [locationMode, setLocationMode] = useState("auto");

  /* ===============================
     SAFE SETTER
  =============================== */

  const setViewLocation = (loc, mode = "manual") => {
    if (!loc) return;

    const newLoc = {
      ...loc,
      updatedAt: Date.now(),
    };

    console.log("📍 setViewLocation:", newLoc, "mode:", mode);

    if (mode === "manual") {
      setManualLocation(newLoc);
      setLocationMode("manual");
    }

    setViewLocationState(newLoc);
  };

  /* ===============================
     PERSIST
  =============================== */

  useEffect(() => {
    if (viewLocation) {
      localStorage.setItem("viewLocation", JSON.stringify(viewLocation));
    }
  }, [viewLocation]);

  /* ===============================
     CLEANUP OLD IP (ONE-TIME)
  =============================== */

  useEffect(() => {
    const saved = localStorage.getItem("viewLocation");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed?.type === "ip") {
          localStorage.removeItem("viewLocation");
          console.log("🧹 Cleared old IP location");
        }
      } catch {}
    }
  }, []);

  /* ===============================
     RESOLUTION LOGIC (NO IP)
  =============================== */

  const resolveLocation = ({ mode, manual, home, live }) => {
    if (mode === "manual" && manual) return manual;
    if (home) return home;
    if (live) return live;
    return null; // 🚨 IP NEVER USED
  };

  /* ===============================
     INIT
  =============================== */

  useEffect(() => {
    const init = async () => {
      // 🚨 DO NOT override manual
      if (locationMode === "manual") return;

      let home = null;

      // 1. Load home location
      const savedHome = localStorage.getItem("homeLocation");
      if (savedHome) {
        home = JSON.parse(savedHome);
        setHomeLocation(home);
      }

      // 2. Fetch IP (HINT ONLY)
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        const ip = {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          state: data.region_code,
          label: `${data.city}, ${data.region_code}`,
          type: "ip",
        };

        setIpLocation(ip); // ✅ DO NOT set as viewLocation
      } catch (err) {
        console.warn("IP location failed");
      }

      // 3. Resolve trusted sources only
      const resolved = resolveLocation({
        mode: locationMode,
        manual: manualLocation,
        home,
        live: null,
      });

      if (resolved) {
        setViewLocation(resolved, "auto");
      }
    };

    init();
  }, []);

  /* ===============================
     LIVE LOCATION (GPS + ENRICHED)
  =============================== */

  const enableLiveLocation = async () => {
    if (!navigator.geolocation) return;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;

            console.log("📡 GPS:", { lat, lng, accuracy });

            const enriched = await enrichLocation({
              lat,
              lng,
              accuracy,
            });

            setLiveLocation(enriched);

            if (locationMode !== "manual") {
              setViewLocation(enriched, "auto");
            }

            resolve(enriched);
          } catch (err) {
            console.error("❌ Enrichment failed:", err);
            reject(err);
          }
        },
        (err) => {
          console.error("❌ Geolocation error:", err);
          reject(err);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  /* ===============================
     SET HOME LOCATION
  =============================== */

  const enableHomeLocation = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const enriched = await enrichLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });

          const loc = {
            ...enriched,
            type: "home",
          };

          setHomeLocation(loc);
          localStorage.setItem("homeLocation", JSON.stringify(loc));

          console.log("🏠 Home location set:", loc);

          if (locationMode !== "manual") {
            setViewLocation(loc, "auto");
          }
        } catch (err) {
          console.error(err);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  };

  /* ===============================
     EXPORT
  =============================== */

  return (
    <LocationContext.Provider
      value={{
        viewLocation,
        setViewLocation,

        homeLocation,
        liveLocation,
        ipLocation,

        enableLiveLocation,
        enableHomeLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}