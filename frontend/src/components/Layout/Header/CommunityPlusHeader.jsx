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

  const locationText =
    viewLocation?.fullLabel ||
    viewLocation?.label ||
    "";

  /* ===============================
     SYNC INPUT DISPLAY
  =============================== */

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.value = locationText;
  }, [locationText]);

  /* ===============================
     GOOGLE AUTOCOMPLETE
  =============================== */

  console.log("AD.TV LOADED");

  return <div>AD.TV</div>;
  
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

        try {
          const enriched = await resolveLocation({
            lat,
            lng,
            accuracy: 100,
          });

          setViewLocation(enriched, "manual");
        } catch (err) {
          console.error("❌ Enrichment failed:", err);
        }
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

  /* ===============================
     GPS LOCATION
  =============================== */

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
      (err) => {
        console.error("❌ Geolocation error:", err);
        setResolving(false);
      },
      { enableHighAccuracy: true }
    );
  };

  /* ===============================
     OUTSIDE CLICK
  =============================== */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     NAVIGATION
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

      <div className="header-row">

        {/* LEFT */}
        <div className="header-left">

          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
            onClick={() => go("/home")}
          />

          {/* 🔥 LOCATION (UPGRADED) */}
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
          <div className="search-wrapper">
            <input
              className="search-input body"
              placeholder="Search"
            />
          </div>
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

                  <div
                    className="menu-item"
                    onClick={() => go("/profile")}
                  >
                    Profile
                  </div>

                  <div
                    className="menu-item"
                    onClick={() => onLogout?.()}
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
          className={`btn btn-ghost ${isActive("/home") ? "active" : ""}`}
        >
          Home
        </button>

        <button
          onClick={() => go("/post")}
          className={`btn btn-ghost ${isActive("/post") ? "active" : ""}`}
        >
          Post
        </button>

        <button
          onClick={() => go("/event")}
          className={`btn btn-ghost ${isActive("/event") ? "active" : ""}`}
        >
          Event
        </button>

        <button
          onClick={() => go("/incident")}
          className={`btn btn-ghost ${isActive("/incident") ? "active" : ""}`}
        >
          Incident
        </button>

        <button
          onClick={() => go("/adtv")}
          className={`btn btn-ghost ${isActive("/adtv") ? "active" : ""}`}
        >
          📺 <span className="label">AD.TV</span>
          <span className="adtv-sp">SP</span>
        </button>

      </nav>
    </header>
  );
}