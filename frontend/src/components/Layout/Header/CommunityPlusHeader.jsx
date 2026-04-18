import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusHeader.css";
import { useLocationContext } from "../../../context/LocationContext";
import { useAuth } from "../../../context/AuthContext";

function CommunityPlusHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const menuRef = useRef(null);

  const { viewLocation, setViewLocation } = useLocationContext();
  const { appUser } = useAuth();

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

    if (email.includes("@")) {
      return email.split("@")[0];
    }

    if (effectiveUser?.username && !/^\d+$/.test(effectiveUser.username)) {
      return effectiveUser.username;
    }

    return "Member";
  }, [effectiveUser]);

  const initials = useMemo(() => {
    if (!username) return "ME";

    const parts = username.split(/[\s._-]+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return ((parts[0][0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }, [username]);

  /* ===============================
     LOCATION STATE
  =============================== */

  const formatLocationLabel = (loc) => {
    if (!loc) return "";

    const stateMap = {
      Victoria: "VIC",
      "New South Wales": "NSW",
      Queensland: "QLD",
      "South Australia": "SA",
      Tasmania: "TAS",
      "Western Australia": "WA",
      "Northern Territory": "NT",
      ACT: "ACT",
    };

    const stateShort = stateMap[loc.state] || loc.state;

    return `${loc.suburb || loc.city || loc.label || ""}${stateShort ? `, ${stateShort}` : ""}${loc.postcode ? ` ${loc.postcode}` : ""}`.trim();
  };

  const isExactLocation = useMemo(() => {
    const acc = viewLocation?.accuracy;
    return typeof acc === "number" && acc <= 50;
  }, [viewLocation]);

  useEffect(() => {
    const label =
      viewLocation?.label ||
      formatLocationLabel(viewLocation) ||
      "";

    setManualLocation(label);
  }, [viewLocation]);

  const handleManualLocationCommit = () => {
    if (isExactLocation) return;

    const value = manualLocation.trim();
    if (!value) return;

    setViewLocation({
      ...viewLocation,
      label: value,
      suburb: value,
      city: value,
      accuracy: viewLocation?.accuracy ?? null,
      type: "manual",
    });
  };

  /* ===============================
     CLICK OUTSIDE
  =============================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  /* ===============================
     NAV HELPERS
  =============================== */

  const go = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  /* ===============================
     RENDER
  =============================== */

  return (
    <header className="header">
      <div className="header-row">
        {/* LEFT */}
        <div className="header-left logo-container">
          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
            onClick={() => go("/home")}
          />

          <div className="location-display">
            <span className={`location-pin ${isExactLocation ? "exact" : "editable"}`}>
              📍
            </span>

            <input
              type="text"
              className={`location-input ${isExactLocation ? "locked" : "editable"}`}
              value={manualLocation}
              readOnly={isExactLocation}
              placeholder={isExactLocation ? "Using exact location" : "Enter address"}
              onChange={(e) => {
                if (!isExactLocation) {
                  setManualLocation(e.target.value);
                }
              }}
              onBlur={handleManualLocationCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleManualLocationCommit();
                }
              }}
              title={isExactLocation ? "Using your exact current location" : "Type an address"}
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="header-center">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search"
            />
            <span className="search-enter">⤶</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="header-right">
          {effectiveUser && (
            <div className="user-block" ref={menuRef}>
              <span className="username" title={effectiveUser?.email || ""}>
                {username}
              </span>

              <div className="avatar" onClick={toggleMenu}>
                {initials}
              </div>

              {showMenu && (
                <div className="dropdown-menu">
                  <div
                    className="menu-item"
                    onClick={() => {
                      navigate("/profile");
                      setShowMenu(false);
                    }}
                  >
                    Profile Settings
                  </div>

                  <div
                    className="menu-item"
                    onClick={() => {
                      onLogout?.();
                      setShowMenu(false);
                    }}
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
          className={isActive("/home") ? "active" : ""}
          onClick={() => go("/home")}
        >
          Home
        </button>

        <button
          className={isActive("/post") ? "active" : ""}
          onClick={() => go("/post")}
        >
          Posts
        </button>

        <button
          className={isActive("/event") ? "active" : ""}
          onClick={() => go("/event")}
        >
          Events
        </button>

        <button
          className={isActive("/incident") ? "active" : ""}
          onClick={() => go("/incident")}
        >
          Incidents
        </button>

        <button
          className={isActive("/search") ? "active" : ""}
          onClick={() => go("/search")}
        >
          Search
        </button>

        <button
          className={isActive("/communityplus") ? "active" : ""}
          onClick={() => go("/communityplus")}
        >
          Community+
        </button>

        <button
          className={isActive("/about") ? "active" : ""}
          onClick={() => go("/about")}
        >
          About
        </button>

        <button
          className={isActive("/yellowpages") ? "active" : ""}
          onClick={() => go("/yellowpages")}
        >
          Yellow Pages
        </button>

        <button
          className={isActive("/merch") ? "active" : ""}
          onClick={() => go("/merch")}
        >
          Merch
        </button>
      </nav>
    </header>
  );
}

export default CommunityPlusHeader;