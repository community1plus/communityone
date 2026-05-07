import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import { useLocationContext } from "../../../context/LocationProvider";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const {
    viewLocation,
    locationMode,
    locationLoading,
    locationError,
    setManualLocation,
    useAutoLocation,
  } = useLocationContext();

  const navItems = useMemo(() => {
    const items =
      NAVIGATION.find((item) => item.group === "main")?.items || [];

    return items.filter((item) => item.type === "route" && item.path);
  }, []);

  console.log("HEADER NAV ITEMS:", navItems);

  const isActive = useCallback(
    (path) => {
      if (!path) return false;

      if (path === "/") {
        return routeLocation.pathname === "/";
      }

      return (
        routeLocation.pathname === path ||
        routeLocation.pathname.startsWith(`${path}/`)
      );
    },
    [routeLocation.pathname]
  );

  const go = useCallback(
    (path) => {
      console.log("HEADER NAV CLICK:", {
        currentPath: routeLocation.pathname,
        targetPath: path,
      });

      if (!path) {
        console.warn("Navigation blocked: missing path");
        return;
      }

      if (routeLocation.pathname === path) {
        console.warn("Navigation blocked: already on route");
        return;
      }

      navigate(path);
    },
    [navigate, routeLocation.pathname]
  );

  const handleManualLocationSet = useCallback(
    (nextManualLocation) => {
      if (!nextManualLocation) return;

      console.log("MANUAL LOCATION SET:", nextManualLocation);

      setManualLocation(nextManualLocation);
    },
    [setManualLocation]
  );

  const handleAutoLocationSet = useCallback(() => {
    console.log("AUTO LOCATION REQUESTED");
    useAutoLocation();
  }, [useAutoLocation]);

  return (
    <nav className="header-nav" aria-label="Primary navigation">
      <div className="nav-left">
        <LocationDisplay
          location={viewLocation}
          mode={locationMode}
          loading={locationLoading}
          error={locationError}
          onManualSet={handleManualLocationSet}
          onAutoSet={handleAutoLocationSet}
        />
      </div>

      <div className="nav-links">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => go(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="nav-right" />
    </nav>
  );
}