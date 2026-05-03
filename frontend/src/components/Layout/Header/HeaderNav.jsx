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

  const navItems = useMemo(
    () => NAVIGATION.find((item) => item.group === "main")?.items || [],
    []
  );

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

  const handleManualLocationSet = useCallback(
    (nextManualLocation) => {
      if (!nextManualLocation) return;
      setManualLocation(nextManualLocation);
    },
    [setManualLocation]
  );

  const handleAutoLocationSet = useCallback(() => {
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