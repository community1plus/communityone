import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/UI/Button";
import LocationDisplay from "../../components/Layout/Header/LocationDisplay";

import "./CommunityPlusSplash.css";

export default function CommunityPlusSplash() {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const [locationMode, setLocationMode] = useState("auto");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const [location, setLocation] = useState({
    suburb: "Melbourne",
    city: "Melbourne",
    state: "VIC",
    label: "Melbourne, VIC",
    type: "auto",
    accuracy: "LEVEL_3",
  });

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

  const handleManualSet = (nextLocation) => {
    setLocation(nextLocation);
    setLocationMode("manual");
    setLocationError(null);
  };

  const handleAutoSet = () => {
    setLocationMode("auto");
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationError("Location services are not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          suburb: "Current location",
          city: "Current location",
          state: "",
          label: "Current location",
          type: "auto",
          accuracy: "LEVEL_4",
          updatedAt: Date.now(),
        });

        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setLocationError("Unable to access location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
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
            location={location}
            mode={locationMode}
            loading={locationLoading}
            error={locationError}
            onManualSet={handleManualSet}
            onAutoSet={handleAutoSet}
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
                Build your profile, verify your identity,
                connect your participation, and access
                the Community One ecosystem.
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