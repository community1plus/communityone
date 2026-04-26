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

import { NAVIGATION } from "../../../config/navigation/navigationConfig"; // ✅ fixed path

export default function CommunityPlusHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { viewLocation, setViewLocation } = useLocationContext();
  const { appUser } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [resolving, setResolving] = useState(false);

  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const effectiveUser = appUser?.user || appUser || user;

  /* ===============================
     NAV CONFIG (MEMOIZED)
  =============================== */

  const nav = useMemo(
    () => NAVIGATION.find((n) => n.group === "main") || { items: [] },
    []
  );

  /* ===============================
     NAV HELPERS (FIXED)
  =============================== */

  const isActiveRoute = useCallback(
    (path) => {
      if (!path) return false;

      return (
        routeLocation.pathname === path ||
        routeLocation.pathname.startsWith(path + "/")
      );
    },
    [routeLocation.pathname]
  );

  const isGroupActive = (children) =>
    children?.some((child) => isActiveRoute(child.path));

  const go = useCallback(
    (path) => {
      if (!path) return;
      if (routeLocation.pathname !== path) {
        navigate(path);
      }
    },
    [navigate, routeLocation.pathname]
  );

  /* ===============================
     USERNAME / INITIALS
  =============================== */

  const username = useMemo(() => {
    if (!effectiveUser) return "Member";

    const email =
      effectiveUser?.email ||
      effectiveUser?.attributes?.email ||
      effectiveUser?.signInDetails?.loginId ||
      "";

    if (email.includes("@")) return email.split("@")[0];
    if (effectiveUser?.username) return effectiveUser.username;

    return "Member";
  }, [effectiveUser]);

  const initials = useMemo(() => {
    if (!username) return "ME";

    const parts = username.split(/[\s._-]+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      (parts[0][0] || "") +
      (parts[1]?.[0] || "")
    ).toUpperCase();
  }, [username]);

  /* ===============================
     LOCATION (UNCHANGED)
  =============================== */

  const hasLocation =
    !!viewLocation?.lat ||
    !!viewLocation?.suburb ||
    !!viewLocation?.label;

  const locationText =
    viewLocation?.fullLabel ||
    viewLocation?.label ||
    "";

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.value = locationText;
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
  }, []);

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
    <header className="header panel">

      {/* TOP ROW */}
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
              resolved={hasLocation}
              loading={resolving}
              onClick={handleResolveLocation}
            />

            <input
              ref={inputRef}
              className="location-input body"
              placeholder="Enter suburb or address"
              autoComplete="off"
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="header-center">
          <input
            className="search-input body"
            placeholder="Search"
          />
        </div>

        {/* RIGHT */}
        <div className="header-right" ref={menuRef}>
          {effectiveUser && (
            <div className="user-block">
              <span className="username label">{username}</span>

              <div
                className="avatar"
                onClick={() => setShowMenu(!showMenu)}
              >
                {initials}
              </div>

              {showMenu && (
                <div className="dropdown-menu panel">
                  <div onClick={() => go("/profile")}>Profile</div>
                  <div onClick={() => onLogout?.()}>Logout</div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 🔥 NAV (REFACTORED) */}
      <nav className="header-nav">

        {nav.items.map((item) => {

          /* GROUP */
          if (item.type === "group") {
            const active = isGroupActive(item.children);

            return (
              <div
                key={item.id}
                className={`nav-group ${active ? "active" : ""}`}
              >
                <button className="nav-item">
                  {item.label}
                </button>

                <div className="nav-dropdown">
                  {item.children.map((child) => {
                    const childActive = isActiveRoute(child.path);

                    return (
                      <div
                        key={child.id}
                        className={`nav-dropdown-item ${
                          childActive ? "active" : ""
                        }`}
                        onClick={() => go(child.path)}
                      >
                        {child.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          /* ROUTE */
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