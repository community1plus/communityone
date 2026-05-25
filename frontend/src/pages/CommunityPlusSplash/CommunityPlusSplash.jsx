import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/UI/Button";
import LocationDisplay from "../../components/Layout/Header/LocationDisplay";
/**/ 
import { useUserLocation } from "../../hooks/useUserLocation";
import SplashHeader from "../../components/SplashHeader/SplashHeader";

import "./CommunityPlusSplash.css";

export default function CommunityPlusSplash() {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const handleContinue = () => {
  navigate("/communityplus/profile");
  };

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

      <main className="communityplus-main">

        <div
          className={`communityplus-splash-card ${
            visible ? "visible" : ""
          }`}
        >

          <div className="communityplus-hero">

            <div className="communityplus-visual">

              <img
                src="/logo/echo_splash.png"
                alt="Echo"
                className={`communityplus-hero-logo${
                  logoLoaded ? " loaded" : ""
                }`}
              />

            </div>

            <div className="communityplus-splash-copy">

              <h1>
                Welcome to
                <span>Community One</span>
              </h1>

              <p>
                Community. Connection. Voice.
              </p>

            </div>

            <div className="communityplus-splash-actions">

            <Button
                onClick={handleContinue}
                className="communityplus-cta"
              >
                Continue to Profile Setup
              </Button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}