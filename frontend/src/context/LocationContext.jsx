import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();

export const useLocationContext = () => useContext(LocationContext);

export function LocationProvider({ children }) {
  const [homeLocation, setHomeLocation] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [viewLocation, setViewLocation] = useState(null);

  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /* ===============================
  🔄 REVERSE GEOCODE (SUBURB)
  =============================== */

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
      );

      const data = await res.json();
      const components = data.results?.[0]?.address_components || [];

      const suburb =
        components.find(c => c.types.includes("sublocality_level_1")) ||
        components.find(c => c.types.includes("locality"));

      const state = components.find(c =>
        c.types.includes("administrative_area_level_1")
      );

      const postcode = components.find(c =>
        c.types.includes("postal_code")
      );

      return `${suburb?.long_name || ""}, ${state?.short_name || ""} ${postcode?.long_name || ""}`.trim();
    } catch {
      return "Near you";
    }
  };

  /* ===============================
  📍 INITIALISE LOCATION (SMART)
  =============================== */

  useEffect(() => {
    
          // ✅ 2. TRY HIGH-ACCURACY GPS (SILENT)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            const label = await reverseGeocode(lat, lng);

            const loc = {
              label,
              lat,
              lng,
              accuracy: pos.coords.accuracy,
              type: "live"
            };

            setLiveLocation(loc);

            // 🔥 only override if no saved location
            setViewLocation(prev => prev || loc);
          },
          () => {},
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000
          }
        );
      }

    const initLocation = async () => {
      // ✅ 1. LOAD SAVED LOCATION (BEST)
      const saved = localStorage.getItem("homeLocation");

      if (saved) {
        const loc = JSON.parse(saved);
        setHomeLocation(loc);
        setViewLocation(loc);
      }



      // ✅ 3. FALLBACK TO IP (ONLY IF NOTHING ELSE)
      if (!saved) {
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();

          const loc = {
            label: `${data.city}, ${data.region_code}`,
            lat: data.latitude,
            lng: data.longitude,
            type: "home"
          };

          setHomeLocation(loc);
          setViewLocation(prev => prev || loc);
        } catch {
          console.error("IP location failed");
        }
      }
    };

    initLocation();
  }, []);

  /* ===============================
  📡 MANUAL GPS (USER CLICK)
  =============================== */

  const enableLiveLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const label = await reverseGeocode(lat, lng);

        const loc = {
          label,
          lat,
          lng,
          accuracy: pos.coords.accuracy,
          type: "live"
        };

        setLiveLocation(loc);
        setViewLocation(loc);

        console.log("High accuracy location:", loc);
      },
      (err) => {
        console.warn("GPS failed:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /* ===============================
  📍 SET HOME LOCATION (FROM PICKER)
  =============================== */

  const setHome = (loc) => {
    setHomeLocation(loc);
    setViewLocation(loc);
    localStorage.setItem("homeLocation", JSON.stringify(loc));
  };

  return (
    <LocationContext.Provider
      value={{
        homeLocation,
        liveLocation,
        viewLocation,
        setViewLocation,
        enableLiveLocation,
        setHome // 🔥 important for suburb picker
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}