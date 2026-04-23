import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusHeader.css";
import { useLocationContext } from "../../../context/LocationProvider";
import { useAuth } from "../../../context/AuthContext";
import LocationPin from "../../UI/LocationPin";
import { resolveLocation } from "../../../services/resolveLocation";

import { NAVIGATION } from "../Navigation/navigationConfig"; // 🔥 adjust path if needed

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

  const nav = NAVIGATION.find((n) => n.group === "main"); // 🔥 NEW

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
     LOCATION
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
      if (
        !window.google ||
        !window.google.maps ||
        !inputRef.current
      ) return false;

      const autocomplete =
        new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["geocode"],
            componentRestrictions: { country: "au" },
          }
        );

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const enriched = await resolveLocation({
          lat,
          lng,
          accuracy: 100,
        });

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

        const enriched = await resolveLocation({
          lat,
          lng,
          accuracy,
        });

        setViewLocation(enriched, "auto");
        setResolving(false);
      },
      () => setResolving(false),
      { enableHighAccuracy: true }
    );
  };

  /* ===============================
     NAV HELPERS
  =============================== */

  const go = (path) => {
    if (routeLocation.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = (path) => routeLocation.pathname === path;

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

        {/* CENTER SEARCH */}
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

              <span className="username label">
                {username}
              </span>

              <div
                className="avatar"
                onClick={() => setShowMenu(!showMenu)}
              >
                {initials}
              </div>

              {showMenu && (
                <div className="dropdown-menu panel">
                  <div onClick={() => go("/profile")}>
                    Profile
                  </div>
                  <div onClick={() => onLogout?.()}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 🔥 CONFIG-DRIVEN NAV */}
      <nav className="header-nav">

        {nav?.items.map((item) => {

          if (item.children) {
            const isGroupActive = item.children.some((child) =>
              isActive(child.path)
            );

            return (
              <div
                key={item.label}
                className={`nav-group ${isGroupActive ? "active" : ""}`}
              >
                <button className="nav-item">
                  {item.label}
                </button>

                <div className="nav-dropdown">
                  {item.children.map((child) => (
                    <div
                      key={child.path}
                      className={`nav-dropdown-item ${
                        isActive(child.path) ? "active" : ""
                      }`}
                      onClick={() => go(child.path)}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.path}
              className={`nav-item ${
                isActive(item.path) ? "active" : ""
              }`}
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