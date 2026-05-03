import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import { useLocationContext } from "../../../context/LocationProvider";
import { useUserLocation } from "../../../hooks/useUserLocation";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { viewLocation, setViewLocation } = useLocationContext();

  const {
    autoLocation,
    manualLocation,
    displayLocation,
    mode,
    loading,
    error,
    setAutoMode,
    setManualMode,
  } = useUserLocation();

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

  /*
    AUTO TRIGGER:
    On load, if the hook is in auto mode but has not resolved yet,
    explicitly start auto geolocation.
  */
  useEffect(() => {
    if (mode !== "auto") return;
    if (autoLocation) return;
    if (loading) return;

    setAutoMode();
  }, [mode, autoLocation, loading, setAutoMode]);

  /*
    SYNC DISPLAY LOCATION INTO GLOBAL VIEW LOCATION
  */
  useEffect(() => {
    if (!displayLocation) return;

    setViewLocation(displayLocation, mode);
  }, [displayLocation, mode, setViewLocation]);

  const handleManualLocationSet = useCallback(
    (nextManualLocation) => {
      if (!nextManualLocation) return;

      setManualMode(nextManualLocation);
      setViewLocation(nextManualLocation, "manual");
    },
    [setManualMode, setViewLocation]
  );

  const handleAutoLocationSet = useCallback(() => {
    setAutoMode();
  }, [setAutoMode]);

  const locationForDisplay = displayLocation || viewLocation;

  return (
    <nav className="header-nav" aria-label="Primary navigation">
      <div className="nav-left">
        <LocationDisplay
          location={locationForDisplay}
          mode={mode}
          loading={loading}
          error={error}
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