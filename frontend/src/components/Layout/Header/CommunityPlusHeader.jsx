import React, { createContext, useContext, useEffect, useState } from "react";

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
    return saved ? JSON.parse(saved) : null;
  });

  const [manualLocation, setManualLocation] = useState(null);
  const [locationMode, setLocationMode] = useState("auto"); // "auto" | "manual"

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
     INIT (CLEAN + CONTROLLED)
  =============================== */

  useEffect(() => {
    const init = async () => {
      let home = null;

      // 1. Load HOME first (primary fallback)
      const savedHome = localStorage.getItem("homeLocation");
      if (savedHome) {
        home = JSON.parse(savedHome);
        setHomeLocation(home);
      }

      // 2. ONLY set viewLocation if home exists
      if (locationMode !== "manual" && home) {
        setViewLocation(home, "auto");
      }

      // 3. Fetch IP quietly (DO NOT activate)
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
    };

    init();
  }, []);

  /* ===============================
     LIVE LOCATION (PIN CLICK ONLY)
  =============================== */

  const enableLiveLocation = async () => {
    if (!navigator.geolocation) return;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            label: "Current location",
            type: "live",
          };

          console.log("📍 Live location:", loc);

          setLiveLocation(loc);

          if (locationMode !== "manual") {
            setViewLocation(loc, "auto");
          }

          resolve(loc);
        },
        (err) => {
          console.error("Geolocation error:", err);

          // 🔥 OPTIONAL: fallback to IP ONLY after failure
          if (ipLocation && locationMode !== "manual") {
            console.log("⚠️ Falling back to IP");

            setViewLocation(ipLocation, "auto");
            resolve(ipLocation);
          } else {
            reject(err);
          }
        },
        { enableHighAccuracy: true }
      );
    });
  };

  /* ===============================
     SET HOME LOCATION (OPTIONAL)
  =============================== */

  const enableHomeLocation = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Home",
          type: "home",
        };

        console.log("🏠 Home set:", loc);

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