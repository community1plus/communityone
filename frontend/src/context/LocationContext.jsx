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

  const [locationMode, setLocationMode] = useState("auto"); // "auto" | "manual"

  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /* ===============================
     SAFE SET VIEW LOCATION
  =============================== */

  const setViewLocation = (loc, mode = "manual") => {
    if (!loc) return;

    const newLocation = {
      ...loc,
      updatedAt: Date.now(), // 🔥 force re-render
    };

    console.log("📍 setViewLocation:", newLocation, "mode:", mode);

    setLocationMode(mode);
    setViewLocationState(newLocation);
  };

  /* ===============================
     PERSIST VIEW LOCATION
  =============================== */

  useEffect(() => {
    if (viewLocation) {
      localStorage.setItem("viewLocation", JSON.stringify(viewLocation));
    }
  }, [viewLocation]);

  /* ===============================
     PARSE ADDRESS
  =============================== */

  const parseAddress = (components = []) => {
    const get = (type) =>
      components.find((c) => c.types.includes(type));

    return {
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
  };

  /* ===============================
     GOOGLE GEOCODER
  =============================== */

  const reverseGeocodeGoogle = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
      );

      const data = await res.json();
      const results = data.results || [];

      const best =
        results.find(
          (r) =>
            r.types.includes("street_address") &&
            r.geometry?.location_type === "ROOFTOP"
        ) ||
        results.find((r) => r.types.includes("street_address")) ||
        results.find((r) => r.types.includes("route")) ||
        results[0];

      const parsed = parseAddress(best?.address_components || []);

      return { ...parsed, lat, lng, source: "google" };
    } catch {
      return null;
    }
  };

  /* ===============================
     OSM FALLBACK
  =============================== */

  const reverseGeocodeOSM = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      const data = await res.json();
      const a = data.address || {};

      return {
        country: a.country,
        state: a.state,
        city: a.city || a.town,
        suburb: a.suburb,
        postcode: a.postcode,
        street: a.road,
        streetNumber: a.house_number,
        lat,
        lng,
        source: "osm",
      };
    } catch {
      return null;
    }
  };

  /* ===============================
     SPECIFICITY
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
     HYBRID GEOCODER
  =============================== */

  const reverseGeocode = async (lat, lng) => {
    let g = await reverseGeocodeGoogle(lat, lng);

    if (specificityScore(g) < 90) {
      const osm = await reverseGeocodeOSM(lat, lng);
      if (osm) g = { ...g, ...osm, source: "hybrid" };
    }

    const label = [g?.suburb, g?.state, g?.postcode]
      .filter(Boolean)
      .join(", ");

    return {
      ...g,
      label: label || "Near you",
    };
  };

  /* ===============================
     SCORING
  =============================== */

  const inferHomeAccuracy = (loc) => {
    if (loc.streetNumber) return 50;
    if (loc.street) return 150;
    if (loc.suburb) return 1000;
    if (loc.city) return 5000;
    return 10000;
  };

  const scoreLocation = (loc) => {
    if (!loc) return 0;

    const spec = specificityScore(loc);

    const accScore =
      loc.accuracy < 50 ? 50 :
      loc.accuracy < 200 ? 40 :
      loc.accuracy < 1000 ? 30 :
      loc.accuracy < 5000 ? 20 :
      10;

    return spec + accScore;
  };

  const resolveBestLocation = ({ home, live, ip }) => {
    const candidates = [live, home, ip].filter(Boolean);

    candidates.sort((a, b) => scoreLocation(b) - scoreLocation(a));

    const best = candidates[0];

    console.log("📊 LOCATION RESOLUTION:", best);

    return best;
  };

  /* ===============================
     INIT
  =============================== */

  useEffect(() => {
    const init = async () => {
      let home = null;

      const saved = localStorage.getItem("homeLocation");
      if (saved) {
        home = JSON.parse(saved);
        home.accuracy = inferHomeAccuracy(home);
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
          accuracy: 5000,
          type: "ip",
        };

        setIpLocation(ip);
      } catch {}

      if (locationMode !== "manual") {
        const best = resolveBestLocation({ home, live: null, ip });
        setViewLocation(best, "auto");
      }
    };

    init();
  }, []);

  /* ===============================
     LIVE LOCATION
  =============================== */

  const enableLiveLocation = () => {
    if (!navigator.geolocation) return;

    let bestAccuracy = Infinity;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;

          const geo = await reverseGeocode(lat, lng);

          const loc = {
            ...geo,
            accuracy,
            type: "live",
          };

          setLiveLocation(loc);

          if (locationMode !== "manual") {
            const best = resolveBestLocation({
              home: homeLocation,
              live: loc,
              ip: ipLocation,
            });

            setViewLocation(best, "auto");
          }
        }
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true }
    );

    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 10000);
  };

  /* ===============================
     HOME LOCATION (GPS)
  =============================== */

  const enableHomeLocation = () => {
    if (!navigator.geolocation) return;

    let bestAccuracy = Infinity;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;

          const geo = await reverseGeocode(lat, lng);

          const loc = {
            ...geo,
            accuracy,
            type: "home",
          };

          setHomeLocation(loc);
          setViewLocation(loc, "auto");

          localStorage.setItem("homeLocation", JSON.stringify(loc));

          console.log("🏠 HOME SET:", loc);
        }
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true }
    );

    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 10000);
  };

  /* ===============================
     EXPORT
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
        enableHomeLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}