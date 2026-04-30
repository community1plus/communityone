import React, {
useState,
useEffect,
useRef,
useMemo,
useCallback,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusHeader.css";

import { useLocationContext } from "../../../context/LocationProvider";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleMaps } from "../../../context/GoogleMapsProvider";

import LocationPin from "../../UI/LocationPin";
import { resolveLocation } from "../../../services/resolveLocation";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

/* ===============================
OSM FALLBACK
=============================== */

async function resolveWithOSM(lat, lng) {
try {
const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
);


const data = await res.json();

return {
  lat,
  lng,
  suburb: data.address?.suburb || data.address?.city,
  state: data.address?.state,
  label: data.display_name,
  source: "osm",
};


} catch {
return null;
}
}

/* ===============================
COMPONENT
=============================== */

export default function CommunityPlusHeader({ onLogout }) {
const navigate = useNavigate();
const routeLocation = useLocation();

const { viewLocation, setViewLocation } = useLocationContext();
const { user, loading } = useAuth();
const { isLoaded } = useGoogleMaps();

const [showMenu, setShowMenu] = useState(false);
const [resolving, setResolving] = useState(false);
const [inputValue, setInputValue] = useState("");

const inputRef = useRef(null);
const autocompleteRef = useRef(null);
const hasAutoResolved = useRef(false);

/* ===============================
USER
=============================== */

const username = user?.displayName || "Guest";

const initials = useMemo(() => {
if (!username || username === "Guest") return "G";


return username
  .split(" ")
  .map((w) => w[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();


}, [username]);

/* ===============================
NAV
=============================== */

const nav = useMemo(
() => NAVIGATION.find((n) => n.group === "main") || { items: [] },
[]
);

const isActiveRoute = useCallback(
(path) =>
path &&
(routeLocation.pathname === path ||
routeLocation.pathname.startsWith(path + "/")),
[routeLocation.pathname]
);

const go = useCallback(
(path) => {
if (path && routeLocation.pathname !== path) navigate(path);
},
[navigate, routeLocation.pathname]
);

/* ===============================
LOCATION DISPLAY (🔥 FIXED)
=============================== */

const locationText = useMemo(() => {
if (!viewLocation) return "";


const suburb = viewLocation.suburb;
const state = viewLocation.state;

if (suburb && state) return `${suburb}, ${state}`;
if (suburb) return suburb;

return "";


}, [viewLocation]);

useEffect(() => {
if (locationText) {
setInputValue(locationText);
}
}, [locationText]);

/* ===============================
GEOLOCATION
=============================== */

const handleResolveLocation = useCallback(() => {
if (!navigator.geolocation) return;


setResolving(true);

navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;

    const enriched =
      (await resolveLocation({ lat, lng, accuracy })) ||
      (await resolveWithOSM(lat, lng));

    if (enriched) {
      setViewLocation(enriched, "auto");

      setInputValue(
        [enriched.suburb, enriched.state]
          .filter(Boolean)
          .join(", ")
      );
    }

    setResolving(false);
  },
  () => setResolving(false),
  { enableHighAccuracy: true }
);


}, [setViewLocation]);

/* AUTO LOAD */

useEffect(() => {
if (hasAutoResolved.current) return;
if (viewLocation) return;


hasAutoResolved.current = true;
handleResolveLocation();


}, [viewLocation, handleResolveLocation]);

/* ===============================
GOOGLE AUTOCOMPLETE
=============================== */

useEffect(() => {
if (!isLoaded) return;
if (!window.google?.maps?.places) return;
if (!inputRef.current) return;
if (autocompleteRef.current) return;


const autocomplete = new window.google.maps.places.Autocomplete(
  inputRef.current,
  {
    types: ["geocode"],
    componentRestrictions: { country: "au" },
  }
);

const listener = autocomplete.addListener("place_changed", async () => {
  const place = autocomplete.getPlace();
  if (!place.geometry) return;

  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();

  const enriched =
    (await resolveLocation({
      lat,
      lng,
      accuracy: 100,
      placeId: place.place_id,
    })) ||
    (await resolveWithOSM(lat, lng));

  if (!enriched) return;

  setViewLocation(enriched, "manual");

  setInputValue(
    [enriched.suburb, enriched.state]
      .filter(Boolean)
      .join(", ")
  );
});

autocompleteRef.current = autocomplete;

return () => {
  if (listener) listener.remove();
  autocompleteRef.current = null;
};


}, [isLoaded, setViewLocation]);

/* ===============================
RENDER
=============================== */

return ( <header className="header-root"> <div className="header-row">


    {/* LEFT */}
    <div className="header-left">
      <img
        src="/logo/logo.png"
        alt="Community One"
        className="logo"
        onClick={() => go("/home")}
      />

      <div className="location-display">
        <LocationPin
          resolved={!!locationText}
          loading={resolving}
          onClick={handleResolveLocation}
        />

        <input
          ref={inputRef}
          className="location-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter suburb"
        />
      </div>
    </div>

    {/* CENTER */}
    <div className="header-center">
      <input
        className="search-input"
        placeholder="Search"
      />
    </div>

    {/* RIGHT */}
    <div className="header-right">
      <div className="user-block">
        <span className="username">
          {loading ? "..." : username}
        </span>

        <div
          className="avatar"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          {initials}
        </div>

        {showMenu && (
          <div className="dropdown-menu">
            <div onClick={() => go("/profile")}>Profile</div>
            <div onClick={() => onLogout?.()}>Logout</div>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* NAV */}
  <nav className="header-nav">
    {nav.items.map((item) => {
      const active = isActiveRoute(item.path);

      return (
        <button
          key={item.id}
          className={`nav-item ${active ? "active" : ""}`}
          onClick={() => go(item.path)}
        >
          {item.label}
        </button>
      );
    })}
  </nav>
</header>


);
}
