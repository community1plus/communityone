import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();

export const useLocationContext = () => useContext(LocationContext);

export function LocationProvider({ children }) {
  const [homeLocation, setHomeLocation] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [viewLocation, setViewLocation] = useState(null);

  /* ===============================
  📍 INITIALISE HOME LOCATION (TEMP: IP)
  =============================== */

  useEffect(() => {
    const initLocation = async () => {
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
        setViewLocation(loc); // 🔥 default
      } catch {
        console.error("Location init failed");
      }
    };

    initLocation();
  }, []);

  /* ===============================
  📡 LIVE LOCATION (GPS)
  =============================== */

  const enableLiveLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          label: "Near you",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          type: "live"
        };

        setLiveLocation(loc);
        setViewLocation(loc); // 🔥 switch context
      },
      () => {
        alert("Location permission denied");
      }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        homeLocation,
        liveLocation,
        viewLocation,
        setViewLocation,
        enableLiveLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}