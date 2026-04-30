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
LOCATION TEXT
=============================== */

const locationText =
viewLocation?.label ||
viewLocation?.suburb ||
"";

/* keep input in sync */
useEffect(() => {
setInputValue(locationText);
}, [locationText]);

/* ===============================
GEOLOCATION (AUTO + MANUAL)
=============================== */

const handleResolveLocation = useCallback(() => {
if (!navigator.geolocation) return;

setResolving(true);

navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;

    try {
      const enriched = await resolveLocation({ lat, lng, accuracy });

      setViewLocation(
        {
          ...enriched,
          label:
            enriched?.label ||
            enriched?.suburb ||
            "Current location",
          lat,
          lng,
        },
        "auto"
      );

      setInputValue(
        enriched?.label || enriched?.suburb || "Current location"
      );
    } catch {
      // fallback if resolve fails
      setViewLocation(
        {
          lat,
          lng,
          label: "Current location",
        },
        "fallback"
      );

      setInputValue("Current location");
    }

    setResolving(false);
  },
  () => {
    setResolving(false);
  },
  { enableHighAccuracy: true }
);


}, [setViewLocation]);

/* AUTO LOAD LOCATION (ONCE) */

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

  const address = place.formatted_address;

  // update input immediately
  setInputValue(address);

  try {
    const enriched = await resolveLocation({ lat, lng, accuracy: 100 });

    setViewLocation(
      {
        ...enriched,
        label: enriched?.label || address,
        lat,
        lng,
      },
      "manual"
    );
  } catch {
    setViewLocation(
      {
        lat,
        lng,
        label: address,
      },
      "manual"
    );
  }
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

return ( <header className="header-root">

  {/* ROW */}
  <div className="header-row">

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
          placeholder="Enter suburb or address"
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
