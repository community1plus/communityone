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

  /* =====================================================
     NAV ITEMS
  ===================================================== */

  const navItems = useMemo(() => {
    const mainNav = NAVIGATION.find(
      (item) => item.group === "main"
    );

    return (mainNav?.items || []).filter(
      (item) => item.type === "route" && item.path
    );
  }, []);

  /* =====================================================
     ACTIVE ROUTE DETECTION
  ===================================================== */

  const isActive = useCallback(
    (path) => {
      if (!path) return false;

      const pathname = routeLocation.pathname || "";
      const search = routeLocation.search || "";

      /*
      -----------------------------------------------------
      ROOT
      -----------------------------------------------------
      */

      if (path === "/") {
        return pathname === "/";
      }

      /*
      -----------------------------------------------------
      COMMUNITY HOME
      Exact only.
      Prevent iVIEW routes activating Home.
      -----------------------------------------------------
      */

      if (path === "/communityplus") {
        return (
          pathname === "/communityplus" ||
          pathname === "/communityplus/home"
        );
      }

      /*
      -----------------------------------------------------
      IVIEW
      Any compose / iview route
      -----------------------------------------------------
      */

      const isIViewRoute =
        pathname.includes("/iview") ||
        pathname.includes("/compose") ||
        search.includes("mode=");

      const isIViewNav =
        path.toLowerCase().includes("iview") ||
        path.toLowerCase().includes("compose");

      if (isIViewNav) {
        return isIViewRoute;
      }

      /*
      -----------------------------------------------------
      STANDARD ROUTES
      -----------------------------------------------------
      */

      return (
        pathname === path ||
        pathname.startsWith(`${path}/`)
      );
    },
    [routeLocation.pathname, routeLocation.search]
  );

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNavigation = useCallback(
    (path) => {
      if (!path) return;

      const currentPath =
        routeLocation.pathname + routeLocation.search;

      /*
      Prevent duplicate nav
      */

      if (currentPath === path) {
        return;
      }

      navigate(path);
    },
    [
      navigate,
      routeLocation.pathname,
      routeLocation.search,
    ]
  );

  /* =====================================================
     LOCATION HANDLERS
  ===================================================== */

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

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <nav
      className="header-nav"
      aria-label="Primary navigation"
    >
      {/* =========================================
          LEFT
      ========================================= */}

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

      {/* =========================================
          CENTER NAV
      ========================================= */}

      <div className="nav-links">
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              type="button"
              className={[
                "nav-item",
                active && "active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                handleNavigation(item.path)
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* =========================================
          RIGHT
      ========================================= */}

      <div className="nav-right" />
    </nav>
  );
}