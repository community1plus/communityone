import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const [currentLocation, setCurrentLocation] = useState({
    suburb: "Wheelers Hill",
    state: "Victoria",
    accuracy: "LEVEL_4",
  });

  const nav = NAVIGATION.find((n) => n.group === "main")?.items || [];

  const isActive = (path) =>
    routeLocation.pathname === path ||
    routeLocation.pathname.startsWith(path + "/");

  const handleManualLocationFix = () => {
    setCurrentLocation({
      suburb: "Wheelers Hill",
      state: "Victoria",
      accuracy: "MANUAL",
    });
  };

  return (
    <nav className="header-nav" aria-label="Primary navigation">
      <div className="nav-left">
        <button
          type="button"
          className="location-button"
          onClick={handleManualLocationFix}
          title="Click to manually fix location"
        >
          <LocationDisplay location={currentLocation} />
        </button>
      </div>

      <div className="nav-links">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="nav-right" />
    </nav>
  );
}