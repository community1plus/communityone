import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import { useLocationContext } from "../../../context/LocationProvider";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const [feedScope, setFeedScope] = useState("local");

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

      const pathname = routeLocation.pathname || "";

      if (path === "/communityplus") {
        return pathname === "/communityplus";
      }

      if (path === "/communityplus/iview") {
        return pathname.includes("/iview") || pathname.includes("/view");
      }

      if (path === "/communityplus/news") {
        return (
          pathname === "/communityplus/news" ||
          pathname.startsWith("/communityplus/news/")
        );
      }

      if (path === "/communityplus/yellowpages") {
        return (
          pathname === "/communityplus/yellowpages" ||
          pathname.startsWith("/communityplus/yellowpages/")
        );
      }

      if (path === "/communityplus/about") {
        return (
          pathname === "/communityplus/about" ||
          pathname.startsWith("/communityplus/about/")
        );
      }

      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [routeLocation.pathname]
  );

  const handleNavigation = useCallback(
    (path) => {
      if (!path || routeLocation.pathname === path) return;
      navigate(path);
    },
    [navigate, routeLocation.pathname]
  );

  const handleScopeToggle = useCallback(() => {
    setFeedScope((prev) => (prev === "local" ? "world" : "local"));
  }, []);

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
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              type="button"
              className={["nav-item", active && "active"]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="nav-right">
        <button
          type="button"
          className={`scope-switch ${feedScope}`}
          onClick={handleScopeToggle}
          aria-label={`Switch to ${
            feedScope === "local" ? "world" : "local"
          } feed`}
          title={`Current: ${feedScope === "local" ? "Local" : "World"}`}
        >
          <span className="scope-label">LOCAL</span>

          <span className="scope-track" aria-hidden="true">
            <span className="scope-thumb" />
          </span>

          <span className="scope-label">WORLD</span>
        </button>
      </div>
    </nav>
  );
}