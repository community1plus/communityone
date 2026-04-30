import React, {
useState,
useEffect,
useRef,
useMemo,
useCallback,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusHeader.css";

import { locationService } from "../../../services/locationService";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleMaps } from "../../../context/GoogleMapsProvider";
import { useGoogleMaps } from "../../../context/GoogleMapsProvider";

import LocationPin from "../../UI/LocationPin";
import { resolveLocation } from "../../../services/resolveLocation";
import { locationService } from "../../../services/LocationService"; // 🔥 NEW
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

/* ===============================
FORMAT DISPLAY
=============================== */

const formatLocationDisplay = (loc) => {
if (!loc) return "";
return [loc.suburb, loc.state].filter(Boolean).join(", ");
};

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
DISPLAY
=============================== */

const locationText = useMemo(() => {
return formatLocationDisplay(viewLocation);
}, [viewLocation]);

useEffect(() => {
if (locationText) {
setInputValue(locationText);
}
}, [locationText]);

/* ===============================
🔥 REAL-TIME LOCATION SERVICE
=============================== */

useEffect(() => {
setResolving(true);


// start tracking
locationService.start(resolveLocation);

const unsubscribe = locationService.subscribe((event) => {
  if (event.type === "location") {
    const loc = {
      ...event.data,
      street: null, // 🔥 force suburb-level
      label: formatLocationDisplay(event.data),
    };

    setViewLocation(loc, "auto");
    setInputValue(formatLocationDisplay(loc));
    setResolving(false);
  }
});

return () => {
  unsubscribe();
  locationService.stop();
};


}, [setViewLocation]);

/* ===============================
PIN CLICK (FORCE REFRESH)
=============================== */

const handleResolveLocation = useCallback(() => {
setResolving(true);


// restart tracking to force fresh GPS lock
locationService.stop();
locationService.start(resolveLocation);


}, []);

/* ===============================
AUTOCOMPLETE
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

  const enriched = await resolveLocation({
    lat,
    lng,
    accuracy: 100,
    placeId: place.place_id,
  });

  if (!enriched) return;

  setViewLocation(enriched, "manual");
  setInputValue(formatLocationDisplay(enriched));
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

    <div className="header-center">
      <input className="search-input" placeholder="Search" />
    </div>

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
