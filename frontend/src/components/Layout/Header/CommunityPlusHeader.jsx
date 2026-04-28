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
import LocationPin from "../../UI/LocationPin";
import { resolveLocation } from "../../../services/resolveLocation";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function CommunityPlusHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { viewLocation, setViewLocation } = useLocationContext();
  const { appUser } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef(null);
  const menuRef = useRef(null);

  /* ===============================
     USER (FIXED)
  =============================== */

  const effectiveUser = appUser || user;

  const username = useMemo(() => {
    if (!effectiveUser) return "Guest";

    const email =
      effectiveUser?.email ||
      effectiveUser?.attributes?.email ||
      effectiveUser?.signInDetails?.loginId;

    if (email) return email.split("@")[0];
    if (effectiveUser?.username) return effectiveUser.username;

    return "Member";
  }, [effectiveUser]);

  const initials = useMemo(() => {
    return username
      .split(/[\s._-]+/)
      .map((p) => p[0])
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
     LOCATION (FIXED)
  =============================== */

  const locationText =
    viewLocation?.fullLabel ||
    viewLocation?.label ||
    viewLocation?.suburb ||
    "";

  useEffect(() => {
    setInputValue(locationText);
  }, [locationText]);

  useEffect(() => {
    let interval;

    const initAutocomplete = () => {
      if (!window.google?.maps || !inputRef.current) return false;

      const autocomplete =
        new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "au" },
        });

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const enriched = await resolveLocation({ lat, lng, accuracy: 100 });
        setViewLocation(enriched, "manual");
      });

      return true;
    };

    if (!initAutocomplete()) {
      interval = setInterval(() => {
        if (initAutocomplete()) clearInterval(interval);
      }, 300);
    }

    return () => clearInterval(interval);
  }, [setViewLocation]);

  const handleResolveLocation = async () => {
    setResolving(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const enriched = await resolveLocation({ lat, lng, accuracy });

        setViewLocation(enriched, "auto");
        setResolving(false);
      },
      () => setResolving(false),
      { enableHighAccuracy: true }
    );
  };

  /* ===============================
     RENDER
  =============================== */

  return (
    <header className="header-root">

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
      <div className="header-right" ref={menuRef}>
        <div className="user-block">
          <span className="username">{username}</span>

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