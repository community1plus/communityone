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
     DISPLAY SYNC
  =============================== */

  const locationText = useMemo(
    () => formatLocationDisplay(viewLocation),
    [viewLocation]
  );

  useEffect(() => {
    if (locationText) setInputValue(locationText);
  }, [locationText]);

  /* ===============================
     LOCATION SERVICE (REAL-TIME)
  =============================== */

  useEffect(() => {
    if (!navigator.geolocation) return;

    setResolving(true);

    locationService.start(resolveLocation);

    const unsubscribe = locationService.subscribe((event) => {
      if (event.type === "location") {
        const loc = {
          ...event.data,
          street: null,
          label: formatLocationDisplay(event.data), // enforce suburb display
        };

        setViewLocation(loc, "auto");
        setInputValue(formatLocationDisplay(loc));
        setResolving(false);
      }

      if (event.type === "error") {
        setResolving(false);
      }
    });

    return () => {
      unsubscribe();
      locationService.stop(); // 🔥 important cleanup
    };
  }, [setViewLocation]);

  /* ===============================
     PIN CLICK (FORCE REFRESH)
  =============================== */

  const handleResolveLocation = useCallback(() => {
    setResolving(true);
    locationService.stop();
    locationService.start(resolveLocation);
  }, []);

  /* ===============================
     AUTOCOMPLETE (MODERN API)
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

      el.style.width = "100%";
      el.style.border = "none";
      el.style.outline = "none";
      el.style.background = "transparent";
      el.style.font = "inherit";

      inputRef.current.replaceWith(el);
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
            accuracy: 100,
            placeId: place.id,
          });

          if (!enriched) return;

          const clean = {
            ...enriched,
            street: null,
            label: formatLocationDisplay(enriched),
          };

          setViewLocation(clean, "manual");
          setInputValue(formatLocationDisplay(clean));
        } catch (err) {
          console.error("Autocomplete select error:", err);
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