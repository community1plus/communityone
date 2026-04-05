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
🧠 PARSE ADDRESS COMPONENTS
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
🌍 GOOGLE REVERSE GEOCODE
=============================== */

const reverseGeocodeGoogle = async (lat, lng) => {
try {
const res = await fetch(
`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
);


  const data = await res.json();
  const results = data.results || [];

  console.log("🌍 GOOGLE RESULTS:", results);

  // 🔥 BEST RESULT SELECTION
  const bestResult =
    results.find(
      (r) =>
        r.types.includes("street_address") &&
        r.geometry?.location_type === "ROOFTOP"
    ) ||
    results.find((r) => r.types.includes("street_address")) ||
    results.find((r) => r.types.includes("premise")) ||
    results.find((r) => r.types.includes("route")) ||
    results[0];

  console.log("🎯 GOOGLE SELECTED:", bestResult?.types);

  const components = bestResult?.address_components || [];
  const parsed = parseAddress(components);

  return {
    ...parsed,
    lat,
    lng,
    source: "google",
  };
} catch (err) {
  console.warn("Google geocode failed", err);
  return null;
}


};

/* ===============================
🌍 OSM FALLBACK
=============================== */

const reverseGeocodeOSM = async (lat, lng) => {
try {
const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
);


  const data = await res.json();

  console.log("🌍 OSM RESULT:", data);

  const addr = data.address || {};

  return {
    country: addr.country,
    state: addr.state,
    city: addr.city || addr.town,
    suburb: addr.suburb,
    postcode: addr.postcode,
    street: addr.road,
    streetNumber: addr.house_number,
    lat,
    lng,
    source: "osm",
  };
} catch (err) {
  console.warn("OSM fallback failed", err);
  return null;
}


};

/* ===============================
🔥 HYBRID GEOCODER
=============================== */

const reverseGeocode = async (lat, lng) => {
let google = await reverseGeocodeGoogle(lat, lng);


// 🔥 IF GOOGLE IS NOT DETAILED → FALLBACK
if (!google?.streetNumber) {
  const osm = await reverseGeocodeOSM(lat, lng);

  if (osm) {
    google = { ...google, ...osm, source: "hybrid" };
  }
}

const label = [
  google?.suburb,
  google?.state,
  google?.postcode,
]
  .filter(Boolean)
  .join(", ");

const result = {
  ...google,
  label: label || "Near you",
};

console.log("📍 FINAL GEOCODE:", result);

return result;


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
const candidates = [live, home, ip].filter(Boolean);


candidates.sort(
  (a, b) => specificityScore(b) - specificityScore(a)
);

const best = candidates[0];

console.log("📊 LOCATION RESOLUTION:", {
  candidates,
  selected: best,
  source: best?.type,
  specificity: specificityScore(best),
});

return best;


};

/* ===============================
📍 INIT
=============================== */

useEffect(() => {
const init = async () => {
let home = null;


  const saved = localStorage.getItem("homeLocation");
  if (saved) {
    home = JSON.parse(saved);
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

    setIpLocation(ip);
  } catch {}

  const best = resolveBestLocation({
    home,
    live: null,
    ip,
  });

  setViewLocation(best);
};

init();


}, []);

/* ===============================
📡 GPS
=============================== */

const enableLiveLocation = () => {
navigator.geolocation.getCurrentPosition(
async (pos) => {
const lat = pos.coords.latitude;
const lng = pos.coords.longitude;


    console.log("📡 GPS:", pos.coords);

    const address = await reverseGeocode(lat, lng);

    const loc = {
      ...address,
      accuracy: pos.coords.accuracy,
      type: "live",
    };

    setLiveLocation(loc);

    const best = resolveBestLocation({
      home: homeLocation,
      live: loc,
      ip: ipLocation,
    });

    setViewLocation(best);
  },
  (err) => console.warn(err),
  { enableHighAccuracy: true }
);


};

/* ===============================
🏠 SET HOME
=============================== */

const setHome = (loc) => {
const enriched = { ...loc, type: "home" };


setHomeLocation(enriched);

const best = resolveBestLocation({
  home: enriched,
  live: liveLocation,
  ip: ipLocation,
});

setViewLocation(best);

localStorage.setItem("homeLocation", JSON.stringify(enriched));


};

return (
<LocationContext.Provider
value={{
homeLocation,
liveLocation,
ipLocation,
viewLocation,
enableLiveLocation,
setHome,
}}
>
{children}
</LocationContext.Provider>
);
}
