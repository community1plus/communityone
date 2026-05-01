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
   CACHE
=============================== */

const STORAGE_KEY = "user_location";
const TTL = 5 * 60 * 1000;

const loadCachedLocation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.updatedAt > TTL) return null;

    return parsed;
  } catch {
    return null;
  }
};

const saveLocation = (loc) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {}
};

/* ===============================
   HELPERS
=============================== */

const formatLocationDisplay = (loc) =>
  [loc?.suburb, loc?.state].filter(Boolean).join(", ");

/* ===============================
   COMPONENT
=============================== */

export default function CommunityPlusHeader({ onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { viewLocation, setViewLocation } = useLocationContext();
  const { user, loading } = useAuth();
  const { isLoaded } = useGoogleMaps();

  // 🔥 PRELOAD CACHE BEFORE RENDER
  const cachedLocationRef = useRef(loadCachedLocation());

  const [showMenu, setShowMenu] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [hasResolvedOnce, setHasResolvedOnce] = useState(
    !!cachedLocationRef.current
  );

  const [resolving, setResolving] = useState(
    !cachedLocationRef.current
  );

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
     HYDRATE CACHE (NO FLICKER)
  =============================== */

  useEffect(() => {
    if (cachedLocationRef.current) {
      setViewLocation(cachedLocationRef.current, "cache");
    }
  }, [setViewLocation]);

  /* ===============================
     DISPLAY VALUE (FINAL)
  =============================== */

  const displayValue = useMemo(() => {
    if (inputValue) return inputValue;

    if (viewLocation?.suburb) {
      return formatLocationDisplay(viewLocation);
    }

    if (!hasResolvedOnce) {
      return "Detecting location...";
    }

    if (resolving) {
      return "Updating location...";
    }

    return "Set location";
  }, [inputValue, resolving, viewLocation, hasResolvedOnce]);

  /* ===============================
     SYNC LOCATION → INPUT
  =============================== */

  useEffect(() => {
    if (!viewLocation) return;

    const formatted = formatLocationDisplay(viewLocation);
    setInputValue((prev) => prev || formatted);
  }, [viewLocation]);

  /* ===============================
     LOCATION SERVICE
  =============================== */

  useEffect(() => {
    if (!navigator.geolocation) return;

    resolveTimeoutRef.current = setTimeout(() => {
      setResolving(false);
      setHasResolvedOnce(true);
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
        saveLocation(clean);

        setResolving(false);
        setHasResolvedOnce(true);
      }

      if (event.type === "error") {
        clearTimeout(resolveTimeoutRef.current);
        setResolving(false);
        setHasResolvedOnce(true);
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
    locationService.resolveNow?.();
  }, []);

  /* ===============================
     AUTOCOMPLETE
  =============================== */

  useEffect(() => {
    if (!isLoaded) return;
    if (!window.google?.maps?.places) return;
    if (!inputRef.current || autocompleteRef.current) return;

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
      saveLocation(clean);
    };

    el.addEventListener("gmp-placeselect", handleSelect);

    return () => {
      el.removeEventListener("gmp-placeselect", handleSelect);
    };
  }, [isLoaded, setViewLocation]);

  /* ===============================
     RENDER
  =============================== */

  return (
    <header className="header-root">
      <div className="header-row">
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
              onClick={() => setShowMenu((p) => !p)}
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