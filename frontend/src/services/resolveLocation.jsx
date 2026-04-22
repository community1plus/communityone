import React, { createContext, useContext, useEffect, useState } from "react";
import { resolveLocation as enrichLocation } from "../../services/resolveLocation";

const LocationContext = createContext();
export const useLocationContext = () => useContext(LocationContext);

export function LocationProvider({ children }) {
  /* ===============================
     STATE
  =============================== */

  const [homeLocation, setHomeLocation] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);

  const [viewLocation, setViewLocationState] = useState(() => {
    const saved = localStorage.getItem("viewLocation");

    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);

      // 🚨 Prevent restoring old IP-based location
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
     SETTER
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
     CLEAN OLD IP
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
     RESOLUTION (NO IP)
  =============================== */

  const resolveLocation = ({ mode, manual, home, live }) => {
    if (mode === "manual" && manual) return manual;
    if (home) return home;
    if (live) return live;
    return null;
  };

  /* ===============================
     INIT
  =============================== */

  useEffect(() => {
    const init = async () => {
      if (locationMode === "manual") return;

      let home = null;

      // Load home
      const savedHome = localStorage.getItem("homeLocation");
      if (savedHome) {
        home = JSON.parse(savedHome);
        setHomeLocation(home);
      }

      // Fetch IP (HINT ONLY)
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

        setIpLocation(ip);
      } catch {
        console.warn("IP location failed");
      }

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
     🔥 HIGH ACCURACY LIVE LOCATION
  =============================== */

  const enableLiveLocation = async () => {
    if (!navigator.geolocation) return;

    return new Promise((resolve, reject) => {
      let bestReading = null;
      let attempts = 0;

      const MAX_ATTEMPTS = 5;
      const MAX_TIME = 10000;
      const GOOD_ACCURACY = 50;

      console.log("📡 Starting high-accuracy sampling...");

      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          attempts++;

          const reading = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };

          console.log(`📍 Sample ${attempts}:`, reading);

          if (!bestReading || reading.accuracy < bestReading.accuracy) {
            bestReading = reading;
          }

          const isGoodEnough = reading.accuracy <= GOOD_ACCURACY;
          const isMaxAttempts = attempts >= MAX_ATTEMPTS;

          if (isGoodEnough || isMaxAttempts) {
            navigator.geolocation.clearWatch(watchId);

            try {
              console.log("✅ Best reading:", bestReading);

              const enriched = await enrichLocation(bestReading);

              setLiveLocation(enriched);

              if (locationMode !== "manual") {
                setViewLocation(enriched, "auto");
              }

              resolve(enriched);
            } catch (err) {
              reject(err);
            }
          }
        },
        (err) => {
          navigator.geolocation.clearWatch(watchId);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: MAX_TIME,
          maximumAge: 0,
        }
      );

      // Timeout fallback
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);

        if (!bestReading) {
          reject(new Error("No readings"));
          return;
        }

        console.log("⏱ Timeout — using best:", bestReading);

        enrichLocation(bestReading)
          .then(resolve)
          .catch(reject);
      }, MAX_TIME + 1000);
    });
  };

  /* ===============================
     HOME LOCATION
  =============================== */

  const enableHomeLocation = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
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

        if (locationMode !== "manual") {
          setViewLocation(loc, "auto");
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