import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();
export const useLocationContext = () => useContext(LocationContext);

export function LocationProvider({ children }) {
const [homeLocation, setHomeLocation] = useState(null);
const [liveLocation, setLiveLocation] = useState(null);
const [viewLocation, setViewLocation] = useState(null);

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
🧠 PARSE GOOGLE ADDRESS LEVELS
=============================== */

const parseAddress = (components = []) => {
const get = (type) =>
components.find((c) => c.types.includes(type));

```
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
```

};

/* ===============================
🌍 REVERSE GEOCODE (FULL HIERARCHY)
=============================== */

const reverseGeocode = async (lat, lng) => {
try {
const res = await fetch(
`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
);

```
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

  return {
    ...parsed,
    label: label || "Near you",
  };
} catch {
  return { label: "Near you" };
}
```

};

/* ===============================
🧠 CONFIDENCE ENGINE
=============================== */

const confidenceScore = (type) => {
switch (type) {
case "live":
return 100;
case "home":
return 80;
case "ip":
return 40;
default:
return 0;
}
};

const resolveBestLocation = (home, live) => {
if (!home && !live) return null;

```
if (home && live) {
  return confidenceScore(live.type) > confidenceScore(home.type)
    ? live
    : home;
}

return live || home;
```

};

/* ===============================
📍 INITIALISE LOCATION
=============================== */

useEffect(() => {
const initLocation = async () => {
// ✅ 1. SAVED HOME
const saved = localStorage.getItem("homeLocation");

```
  if (saved) {
    const loc = JSON.parse(saved);
    setHomeLocation(loc);
    setViewLocation(loc);
    return;
  }

  // ✅ 2. IP FALLBACK
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    const loc = {
      lat: data.latitude,
      lng: data.longitude,
      label: `${data.city}, ${data.region_code}`,
      type: "ip",
      confidence: confidenceScore("ip"),
    };

    setHomeLocation(loc);
    setViewLocation(loc);
  } catch {
    console.error("IP location failed");
  }
};

initLocation();
```

}, []);

/* ===============================
📡 GPS (USER TRIGGERED)
=============================== */

const enableLiveLocation = () => {
if (!navigator.geolocation) return;

```
navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const address = await reverseGeocode(lat, lng);

    const loc = {
      lat,
      lng,
      ...address,
      accuracy: pos.coords.accuracy,
      type: "live",
      confidence: confidenceScore("live"),
    };

    setLiveLocation(loc);

    const best = resolveBestLocation(homeLocation, loc);
    setViewLocation(best);

    console.log("📍 LIVE LOCATION:", loc);
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
```

};

/* ===============================
🏠 SET HOME LOCATION
=============================== */

const setHome = (loc) => {
const enriched = {
...loc,
type: "home",
confidence: confidenceScore("home"),
};

```
setHomeLocation(enriched);

const best = resolveBestLocation(enriched, liveLocation);
setViewLocation(best);

localStorage.setItem("homeLocation", JSON.stringify(enriched));
```

};

/* ===============================
PROVIDER
=============================== */

return (
<LocationContext.Provider
value={{
homeLocation,
liveLocation,
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
