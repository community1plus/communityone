import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const [currentLocation, setCurrentLocation] = useState({
    suburb: "Resolving location...",
    state: "",
    accuracy: "LEVEL_3",
  });

  useEffect(() => {
    // TEMP initial resolver.
    // Replace this later with real geolocation / Google Places result.
    setCurrentLocation({
      suburb: "Wheelers Hill",
      state: "Victoria",
      accuracy: "LEVEL_4", // use LEVEL_3 if only suburb/postcode accuracy
    });
  }, []);

  const nav = NAVIGATION.find((n) => n.group === "main")?.items || [];

  const isActive = (path) =>
    routeLocation.pathname === path ||
    routeLocation.pathname.startsWith(path + "/");

  const handleManualLocationSet = (manualLocation) => {
    setCurrentLocation(manualLocation);
  };

  return (
    <nav className="header-nav" aria-label="Primary navigation">
      <div className="nav-left">
        <LocationDisplay
          location={currentLocation}
          onManualSet={handleManualLocationSet}
        />
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