import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/UI/Button";
import LocationDisplay from "../../components/Layout/Header/LocationDisplay";
import { useUserLocation } from "../../hooks/useUserLocation";

import "./CommunityPlusSplash.css";

export default function CommunityPlusSplash() {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const {
    displayLocation,
    mode,
    loading,
    error,
    setAutoMode,
    setManualMode,
  } = useUserLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoLoaded(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigate("/communityplus/profile");
  };

  return (
    <div className="communityplus-splash-page">
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

      {/* rest of page */}
    </div>
  );
}