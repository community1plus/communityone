import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusHeader.css";

import { useLocationContext } from "../../../context/LocationContext";
import { useAuth } from "../../../context/AuthContext";
import LocationPin from "../../UI/LocationPin";

export default function CommunityPlusHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const {
    viewLocation,
    setViewLocation,
    enableLiveLocation,
  } = useLocationContext();

  const { appUser } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [resolving, setResolving] = useState(false);

  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const effectiveUser = appUser?.user || appUser || user;

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
     LOCATION STATE
  =============================== */

  const hasLocation =
    !!viewLocation?.lat ||
    !!viewLocation?.suburb ||
    !!viewLocation?.label;

  /* ===============================
     GOOGLE AUTOCOMPLETE (FIXED)
  =============================== */

  useEffect(() => {
    let interval;

    const initAutocomplete = () => {
      if (
        !window.google ||
        !window.google.maps ||
        !inputRef.current
      ) {
        return false;
      }

      const autocomplete =
        new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["(regions)"],
            componentRestrictions: { country: "au" },
          }
        );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const getComponent = (type) =>
          place.address_components?.find((c) =>
            c.types.includes(type)
          );

        const newLocation = {
          label: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          suburb: getComponent("locality")?.long_name,
          state:
            getComponent(
              "administrative_area_level_1"
            )?.short_name,
          postcode:
            getComponent("postal_code")?.long_name,
          type: "manual",
        };

        console.log("📍 Selected:", newLocation);

        setViewLocation(newLocation, "manual");
      });

      return true;
    };

    if (!initAutocomplete()) {
      interval = setInterval(() => {
        if (initAutocomplete()) {
          clearInterval(interval);
        }
      }, 300);
    }

    return () => clearInterval(interval);
  }, []);

  /* ===============================
     RESOLVE LOCATION (PIN CLICK)
  =============================== */

  const handleResolveLocation = async () => {
    console.log("📍 Pin clicked");

    setResolving(true);

    try {
      const loc = await enableLiveLocation();
      console.log("✅ Live location:", loc);
    } catch (err) {
      console.error("❌ Location error:", err);
    } finally {
      setResolving(false);
    }
  };

  /* ===============================
     MENU OUTSIDE CLICK
  =============================== */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  /* ===============================
     NAVIGATION
  =============================== */

  const go = (path) => {
    if (routeLocation.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = (path) =>
    routeLocation.pathname === path;

  /* ===============================
     RENDER
  =============================== */

  return (
    <header className="header">
      <div className="header-row">

        {/* LEFT */}
        <div className="logo-container">
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
              title={
                hasLocation
                  ? "Location detected (click to refresh)"
                  : "Click to detect location"
              }
            />

            <input
              ref={inputRef}
              className="location-input"
              placeholder="Enter suburb or city"
              autoComplete="off"
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="header-center">
          <div className="search-wrapper">
            <input
              className="search-input"
              placeholder="Search"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="header-right"
          ref={menuRef}
        >
          {effectiveUser && (
            <div className="user-block">
              <span className="username">
                {username}
              </span>

              <div
                className="avatar"
                onClick={() =>
                  setShowMenu(!showMenu)
                }
              >
                {initials}
              </div>

              {showMenu && (
                <div className="dropdown-menu">
                  <div
                    className="menu-item"
                    onClick={() => go("/profile")}
                  >
                    Profile
                  </div>

                  <div
                    className="menu-item"
                    onClick={() =>
                      onLogout?.()
                    }
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NAV */}
      <nav className="links">
        <button
          onClick={() => go("/home")}
          className={
            isActive("/home") ? "active" : ""
          }
        >
          Home
        </button>

        <button
          onClick={() => go("/post")}
          className={
            isActive("/post") ? "active" : ""
          }
        >
          Post
        </button>

        <button
          onClick={() => go("/event")}
          className={
            isActive("/event") ? "active" : ""
          }
        >
          Event
        </button>

        <button
          onClick={() => go("/incident")}
          className={
            isActive("/incident") ? "active" : ""
          }
        >
          Incident
        </button>
      </nav>
    </header>
  );
}