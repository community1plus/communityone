import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();
export const useLocationContext = () => useContext(LocationContext);

export function LocationProvider({ children }) {
  const [homeLocation, setHomeLocation] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const [viewLocation, setViewLocation] = useState(null);

  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /* ===============================
     🧠 PARSE GOOGLE ADDRESS
  =============================== */

  const parseAddress = (components = []) => {
    console.log("🧩 RAW ADDRESS COMPONENTS:", components);

    const get = (type) =>
      components.find((c) => c.types.includes(type));

    const parsed = {
      country: get("country")?.long_name,
      state: get("administrative_area_level_1")?.short_name,
      city: get("locality")?.long_name,
      suburb:
        get("sublocality_level_1")?.long_name ||
        get("locality")?.long_name,
      postcode: get("postal_code")?.long_name,
      street: get("route")?.long_name,
      streetNumber: get("street_number")?.long_name,
    };

    console.log("🧠 PARSED ADDRESS:", parsed);

    return parsed;
  };

  /* ===============================
     🌍 REVERSE GEOCODE
  =============================== */

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
      );

      const data = await res.json();
      const components = data.results?.[0]?.address_components || [];

      const parsed = parseAddress(components);

      const label = [
        parsed.suburb,
        parsed.state,
        parsed.postcode,
      ]
        .filter(Boolean)
        .join(", ");

      const result = {
        ...parsed,
        label: label || "Near you",
      };

      console.log("🌍 REVERSE GEOCODE RESULT:", result);

      return result;
    } catch {
      console.warn("Reverse geocode failed");
      return { label: "Near you" };
    }
  };

  /* ===============================
     🔥 SPECIFICITY SCORING
  =============================== */

  const specificityScore = (loc) => {
    if (!loc) return 0;

    if (loc.streetNumber && loc.street) return 100;
    if (loc.street) return 90;
    if (loc.suburb || loc.postcode) return 80;
    if (loc.city) return 60;
    if (loc.state) return 40;
    if (loc.country) return 20;

    return 0;
  };

  /* ===============================
     🧠 RESOLVE BEST LOCATION
  =============================== */

  const resolveBestLocation = ({ home, live, ip }) => {
    const candidates = [live, ip, home].filter(Boolean);

    if (candidates.length === 0) return null;

    candidates.sort(
      (a, b) => specificityScore(b) - specificityScore(a)
    );

    const best = candidates[0];

    console.log("📊 LOCATION RESOLUTION:");
    console.log("→ Candidates:", candidates);
    console.log("→ Selected:", best);
    console.log("→ Source:", best?.type);
    console.log("→ Specificity:", specificityScore(best));

    return best;
  };

  /* ===============================
     📍 INITIALISE LOCATION
  =============================== */

  useEffect(() => {
    const initLocation = async () => {
      const saved = localStorage.getItem("homeLocation");

      let home = null;
      if (saved) {
        home = JSON.parse(saved);
        console.log("🏠 HOME LOCATION LOADED:", home);
        setHomeLocation(home);
      }

      let ip = null;
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        ip = {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          state: data.region_code,
          country: data.country_name,
          label: `${data.city}, ${data.region_code}`,
          type: "ip",
        };

        console.log("🌐 IP LOCATION:", ip);

        setIpLocation(ip);
      } catch {
        console.error("IP location failed");
      }

      const best = resolveBestLocation({
        home,
        live: null,
        ip,
      });

      setViewLocation(best);
    };

    initLocation();
  }, []);

  /* ===============================
     📡 GPS
  =============================== */

  const enableLiveLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        console.log("📡 GPS RAW:", pos.coords);

        const address = await reverseGeocode(lat, lng);

        const loc = {
          lat,
          lng,
          ...address,
          accuracy: pos.coords.accuracy,
          type: "live",
        };

        console.log("📍 LIVE LOCATION OBJECT:", loc);

        setLiveLocation(loc);

        const best = resolveBestLocation({
          home: homeLocation,
          live: loc,
          ip: ipLocation,
        });

        setViewLocation(best);
      },
      (err) => {
        console.warn("GPS failed:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /* ===============================
     🏠 SET HOME
  =============================== */

  const setHome = (loc) => {
    const enriched = {
      ...loc,
      type: "home",
    };

    console.log("🏠 SET HOME:", enriched);

    setHomeLocation(enriched);

    const best = resolveBestLocation({
      home: enriched,
      live: liveLocation,
      ip: ipLocation,
    });

    setViewLocation(best);

    localStorage.setItem("homeLocation", JSON.stringify(enriched));
  };

  /* ===============================
     PROVIDER
  =============================== */

  return (
    <LocationContext.Provider
      value={{
        homeLocation,
        liveLocation,
        ipLocation,
        viewLocation,
        setViewLocation,
        enableLiveLocation,
        setHome,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}