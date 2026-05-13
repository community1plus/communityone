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
    const mainNav = NAVIGATION.find((item) => item.group === "main");

    return (mainNav?.items || []).filter(
      (item) => item.type === "route" && item.path
    );
  }, []);

  const isActive = useCallback(
    (path) => {
      if (!path) return false;

      const pathname = routeLocation.pathname;
      const search = routeLocation.search;

      const isCommunityHome =
        pathname === "/communityplus" || pathname === "/communityplus/home";

      const isIViewRoute =
        pathname.includes("/compose") ||
        pathname.includes("/iview") ||
        search.includes("mode=");

      if (path === "/") {
        return pathname === "/";
      }

      if (path === "/communityplus") {
        return isCommunityHome && !isIViewRoute;
      }

      if (
        path.toLowerCase().includes("iview") ||
        path.toLowerCase().includes("compose")
      ) {
        return isIViewRoute;
      }

      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [routeLocation.pathname, routeLocation.search]
  );

  const handleNavigation = useCallback(
    (path) => {
      if (!path) return;

      if (routeLocation.pathname === path) {
        return;
      }

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
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="nav-right" />
    </nav>
  );
}