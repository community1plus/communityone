import { useNavigate, useLocation } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import { useLocationContext } from "../../../context/LocationProvider";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { viewLocation, setViewLocation } = useLocationContext();

  const nav = NAVIGATION.find((n) => n.group === "main")?.items || [];

  const isActive = (path) =>
    routeLocation.pathname === path ||
    routeLocation.pathname.startsWith(path + "/");

  const handleManualLocationSet = (manualLocation) => {
    setViewLocation(manualLocation, "manual");
  };

  return (
    <nav className="header-nav" aria-label="Primary navigation">
      <div className="nav-left">
        <LocationDisplay
          location={viewLocation}
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