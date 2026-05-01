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
import { locationService } from "../../../services/locationService";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

/* ===============================
   HELPERS
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
  const resolveTimeoutRef = useRef(null);

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
     DISPLAY VALUE
  =============================== */

  const displayValue = useMemo(() => {
    if (inputValue) return inputValue;

    if (resolving) return "Detecting location...";

    if (viewLocation?.suburb) {
      return formatLocationDisplay(viewLocation);
    }

    return "Set location";
  }, [inputValue, resolving, viewLocation]);

  /* ===============================
     SYNC LOCATION → INPUT
  =============================== */

  useEffect(() => {
    if (!viewLocation) return;

    const formatted = formatLocationDisplay(viewLocation);

    setInputValue((prev) => prev || formatted);
  }, [viewLocation]);

  /* ===============================
     LOCATION SERVICE (STABLE)
  =============================== */

  useEffect(() => {
    if (!navigator.geolocation) return;

    setResolving(true);

    // 🔥 HARD TIMEOUT (fix spinner issue)
    resolveTimeoutRef.current = setTimeout(() => {
      setResolving(false);
    }, 8000);

    locationService.start(resolveLocation);

    const unsubscribe = locationService.subscribe((event) => {
      if (event.type === "location") {
        clearTimeout(resolveTimeoutRef.current);

        const clean = {
          ...event.data,
          street: null,
          label: formatLocationDisplay(event.data),
        };

        setViewLocation(clean, "auto");
        setResolving(false);
      }

      if (event.type === "error") {
        clearTimeout(resolveTimeoutRef.current);
        setResolving(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(resolveTimeoutRef.current);
    };
  }, [setViewLocation]);

  /* ===============================
     PIN CLICK
  =============================== */

  const handleResolveLocation = useCallback(() => {
    setResolving(true);

    if (locationService.resolveNow) {
      locationService.resolveNow();
    }
  }, []);

  /* ===============================
     AUTOCOMPLETE (SAFE)
  =============================== */

  useEffect(() => {
    if (!isLoaded) return;
    if (!window.google?.maps?.places) return;
    if (!inputRef.current) return;
    if (autocompleteRef.current) return;

    try {
      const el = new window.google.maps.places.PlaceAutocompleteElement({
        types: ["geocode"],
        componentRestrictions: { country: "au" },
      });

      el.style.position = "absolute";
      el.style.inset = "0";
      el.style.opacity = "0";

      const container = inputRef.current.parentElement;
      container.style.position = "relative";
      container.appendChild(el);

      autocompleteRef.current = el;

      const handleSelect = async (e) => {
        try {
          const place = e.placePrediction?.toPlace();
          if (!place) return;

          await place.fetchFields({
            fields: ["location", "id"],
          });

          const lat = place.location?.lat();
          const lng = place.location?.lng();
          if (!lat || !lng) return;

          const enriched = await resolveLocation({
            lat,
            lng,
            accuracy: 50,
            placeId: place.id,
          });

          const clean = {
            ...enriched,
            street: null,
            label: formatLocationDisplay(enriched),
          };

          setViewLocation(clean, "manual");
          setInputValue(formatLocationDisplay(clean));
        } catch (err) {
          console.error("Autocomplete error:", err);
        }
      };

      el.addEventListener("gmp-placeselect", handleSelect);

      return () => {
        el.removeEventListener("gmp-placeselect", handleSelect);
      };
    } catch (err) {
      console.error("Autocomplete init failed:", err);
    }
  }, [isLoaded, setViewLocation]);

  /* ===============================
     RENDER
  =============================== */

  return (
    <header className="header-root">
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
              resolved={!!viewLocation}
              loading={resolving}
              onClick={handleResolveLocation}
            />

            <input
              ref={inputRef}
              className="location-input"
              value={displayValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter suburb"
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="header-center">
          <input className="search-input" placeholder="Search" />
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