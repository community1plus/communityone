import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import { useLocationContext } from "../../../context/LocationProvider";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { viewLocation, setViewLocation } = useLocationContext();

  /* ===============================
     NAV CONFIG
  =============================== */

  const navItems = useMemo(
    () => NAVIGATION.find((n) => n.group === "main")?.items || [],
    []
  );

  /* ===============================
     ROUTING
  =============================== */

  const isActive = useCallback(
    (path) =>
      Boolean(
        path &&
          (routeLocation.pathname === path ||
            routeLocation.pathname.startsWith(`${path}/`))
      ),
    [routeLocation.pathname]
  );

  const go = useCallback(
    (path) => {
      if (!path || routeLocation.pathname === path) return;
      navigate(path);
    },
    [navigate, routeLocation.pathname]
  );

  /* ===============================
     LOCATION HANDLING
  =============================== */

  const handleManualLocationSet = useCallback(
    (manualLocation) => {
      if (!manualLocation) return;

      setViewLocation(manualLocation, "manual");
    },
    [setViewLocation]
  );

  /* ===============================
     RENDER
  =============================== */

  return (
    <nav className="header-nav" aria-label="Primary navigation">
      {/* LEFT: LOCATION */}
      <div className="nav-left">
        <LocationDisplay
          location={viewLocation}
          onManualSet={handleManualLocationSet}
        />
      </div>

      {/* CENTER: NAV LINKS */}
      <div className="nav-links">
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => go(item.path)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* RIGHT: RESERVED */}
      <div className="nav-right" />
    </nav>
  );
}