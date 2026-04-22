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

// ✅ FIXED PATH
import { resolveLocation } from "../../../context/LocationProvider";

export default function CommunityPlusHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const {
    viewLocation,
    setViewLocation,
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
     SYNC INPUT DISPLAY
  =============================== */

  useEffect(() => {
    if (!inputRef.current) return;

    if (viewLocation?.fullLabel) {
      inputRef.current.value = viewLocation.fullLabel;
    } else if (viewLocation?.label) {
      inputRef.current.value = viewLocation.label;
    }
  }, [viewLocation?.updatedAt]);

  /* ===============================
     GOOGLE AUTOCOMPLETE (ENRICHED)
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
            types: ["geocode"],
            componentRestrictions: { country: "au" },
          }
        );

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        console.log("📍 Raw selection:", lat, lng);

        try {
          // 🔥 Manual input has no accuracy → assume medium (100m)
          const enriched = await resolveLocation({
            lat,
            lng,
            accuracy: 100,
          });

          console.log("✅ Enriched location:", enriched);

          setViewLocation(enriched, "manual");

        } catch (err) {
          console.error("❌ Enrichment failed:", err);
        }
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
     RESOLVE LOCATION (PIN CLICK - GPS)
  =============================== */

  const handleResolveLocation = async () => {
    console.log("📍 Pin clicked");

    setResolving(true);

    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          console.log("📡 GPS:", { lat, lng, accuracy });

          const enriched = await resolveLocation({
            lat,
            lng,
            accuracy, // 🔥 REAL ACCURACY USED HERE
          });

          console.log("✅ Live enriched:", enriched);

          setViewLocation(enriched, "auto");
          setResolving(false);
        },
        (err) => {
          console.error("❌ Geolocation error:", err);
          setResolving(false);
        },
        { enableHighAccuracy: true }
      );
    } catch (err) {
      console.error("❌ Location error:", err);
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
              placeholder="Enter address or suburb"
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
        <div className="header-right" ref={menuRef}>
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
          className={isActive("/home") ? "active" : ""}
        >
          Home
        </button>

        <button
          onClick={() => go("/post")}
          className={isActive("/post") ? "active" : ""}
        >
          Post
        </button>

        <button
          onClick={() => go("/event")}
          className={isActive("/event") ? "active" : ""}
        >
          Event
        </button>

        <button
          onClick={() => go("/incident")}
          className={isActive("/incident") ? "active" : ""}
        >
          Incident
        </button>
      </nav>
    </header>
  );
}