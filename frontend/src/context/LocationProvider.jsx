import React, { createContext, useContext, useEffect, useState } from "react";
import { enrichLocation } from "../services/resolveLocation";

const LocationContext = createContext();
export const useLocationContext = () => useContext(LocationContext);

const normalizeLocation = (loc = {}) => {
  const type = loc.type || "auto";
  const accuracyMeters = loc.accuracyMeters ?? loc.accuracy ?? null;

  return {
    lat: loc.lat ?? null,
    lng: loc.lng ?? null,
    suburb: loc.suburb || loc.city || "",
    city: loc.city || loc.suburb || "",
    state: loc.state || "",
    label:
      loc.label ||
      [loc.suburb || loc.city, loc.state].filter(Boolean).join(", ") ||
      "Enter location",
    type,
    accuracy:
      type === "manual"
        ? "MANUAL"
        : accuracyMeters && accuracyMeters <= 100
        ? "LEVEL_4"
        : "LEVEL_3",
    accuracyMeters,
    updatedAt: loc.updatedAt || Date.now(),
  };
};

const chooseViewLocation = ({ mode, manual, home, live }) => {
  if (mode === "manual" && manual) return manual;
  if (home) return home;
  if (live) return live;
  return null;
};

export function LocationProvider({ children }) {
  const [homeLocation, setHomeLocation] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const [locationMode, setLocationMode] = useState("auto");

  const [viewLocation, setViewLocationState] = useState(() => {
    const saved = localStorage.getItem("viewLocation");

    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);

      if (parsed?.type === "ip") {
        localStorage.removeItem("viewLocation");
        return null;
      }

      return normalizeLocation(parsed);
    } catch {
      localStorage.removeItem("viewLocation");
      return null;
    }
  });

  const setViewLocation = (loc, mode = "manual") => {
    if (!loc) return;

    const normalized = normalizeLocation({
      ...loc,
      type: mode === "manual" ? "manual" : loc.type || "auto",
    });

    if (mode === "manual") {
      setManualLocation(normalized);
      setLocationMode("manual");
    }

    setViewLocationState(normalized);
  };

  const enableLiveLocation = async () => {
    if (!navigator.geolocation) return null;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const enriched = await enrichLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracyMeters: pos.coords.accuracy,
            });

            const loc = normalizeLocation({
              ...enriched,
              type: "live",
              accuracyMeters: pos.coords.accuracy,
            });

            setLiveLocation(loc);

            if (locationMode !== "manual") {
              setViewLocation(loc, "auto");
            }

            resolve(loc);
          } catch (err) {
            console.error("Location enrichment failed:", err);
            reject(err);
          }
        },
        (err) => {
          console.warn("Live location unavailable:", err);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    });
  };

  const enableHomeLocation = async () => {
    if (!navigator.geolocation) return null;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const enriched = await enrichLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracyMeters: pos.coords.accuracy,
            });

            const loc = normalizeLocation({
              ...enriched,
              type: "home",
              accuracyMeters: pos.coords.accuracy,
            });

            setHomeLocation(loc);
            localStorage.setItem("homeLocation", JSON.stringify(loc));

            if (locationMode !== "manual") {
              setViewLocation(loc, "auto");
            }

            resolve(loc);
          } catch (err) {
            console.error("Home location failed:", err);
            reject(err);
          }
        },
        (err) => {
          console.warn("Home location unavailable:", err);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    });
  };

  useEffect(() => {
    if (viewLocation) {
      localStorage.setItem("viewLocation", JSON.stringify(viewLocation));
    }
  }, [viewLocation]);

  useEffect(() => {
    const init = async () => {
      if (locationMode === "manual") return;

      let home = null;

      const savedHome = localStorage.getItem("homeLocation");

      if (savedHome) {
        try {
          home = normalizeLocation(JSON.parse(savedHome));
          setHomeLocation(home);
        } catch {
          localStorage.removeItem("homeLocation");
        }
      }

      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        const ip = normalizeLocation({
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          state: data.region_code,
          label: `${data.city}, ${data.region_code}`,
          type: "ip",
        });

        setIpLocation(ip);
      } catch {
        console.warn("IP location failed");
      }

      let resolved = chooseViewLocation({
        mode: locationMode,
        manual: manualLocation,
        home,
        live: liveLocation,
      });

      if (resolved) {
        setViewLocation(resolved, "auto");
        return;
      }

      try {
        const live = await enableLiveLocation();

        if (live) {
          setViewLocation(live, "auto");
        }
      } catch {
        console.warn("Live location unavailable. Waiting for manual input.");
      }
    };

    init();
  }, []);

  const resetManualLocation = () => {
    setManualLocation(null);
    setLocationMode("auto");

    const resolved = chooseViewLocation({
      mode: "auto",
      manual: null,
      home: homeLocation,
      live: liveLocation,
    });

    if (resolved) {
      setViewLocation(resolved, "auto");
    }
  };

  return (
    <LocationContext.Provider
      value={{
        viewLocation,
        setViewLocation,

        homeLocation,
        liveLocation,
        ipLocation,
        manualLocation,
        locationMode,

        enableLiveLocation,
        enableHomeLocation,
        resetManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}