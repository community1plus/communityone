import LocationDisplay from "../LocationDisplay/LocationDisplay";
import { useUserLocation } from "../../hooks/useUserLocation";

import "./SplashHeader.css";

export default function SplashHeader() {
  const {
    displayLocation,
    mode,
    loading,
    error,
    setAutoMode,
    setManualMode,
  } = useUserLocation();

  return (
    <header className="communityplus-splash-header">
      <div className="communityplus-brand">
        <img
          src="/logo/echo_splash.png"
          alt="Community One"
          className="communityplus-logo"
        />

        <span className="communityplus-brand-text">
          COMMUNITY ONE
        </span>
      </div>

      <div className="communityplus-location">
        <LocationDisplay
          location={displayLocation}
          mode={mode}
          loading={loading}
          error={error}
          onManualSet={setManualMode}
          onAutoSet={setAutoMode}
        />
      </div>
    </header>
  );
}