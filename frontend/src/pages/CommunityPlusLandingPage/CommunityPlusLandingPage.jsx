import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import CommunityPlusAuthModal from "../../components/Auth/CommunityPlusAuthModal";

import "./CommunityPlusLandingPage.css";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, isAuthenticated, continueAsGuest } = useAuth();

  const {
    profileReady,
    profileMissing,
    hasProfile,
    isProfileComplete,
  } = useProfile();

  const [showAuth, setShowAuth] = useState(false);

  const returnTo =
    location.state?.returnTo || "/communityplus";

  useEffect(() => {
    if (location.state?.loginRequired) {
      setShowAuth(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;
    if (!profileReady) return;

    const needsProfileSetup =
      profileMissing || !hasProfile || !isProfileComplete;

    if (needsProfileSetup) {
      navigate("/communityplus/welcome", {
        replace: true,
      });
      return;
    }

    navigate(returnTo, {
      replace: true,
    });
  }, [
    loading,
    isAuthenticated,
    profileReady,
    profileMissing,
    hasProfile,
    isProfileComplete,
    navigate,
    returnTo,
  ]);

  const openAuth = () => {
    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
  };

  const handleAuthSuccess = () => {
    closeAuth();
  };

  const handleGuestEntry = () => {
    continueAsGuest();

    navigate("/communityplus");
  };

  if (loading || (isAuthenticated && !profileReady)) {
    return null;
  }

  return (
    <div className="cpl-root">
      <div className="landing-visual-layer" aria-hidden="true">
        <div className="landing-hero-tint" />
        <div className="landing-hero-focus" />
      </div>

      <main className="landing-container">
        <section
          className="landing-hero"
          aria-label="Community.One landing"
        >
          <h1 className="brand-title">Community.One</h1>

          <div className="landing-text">
            <h2 className="landing-tagline">
              Real People. <span className="accent">Real News.</span>{" "}
              Real Time
            </h2>

            <p className="landing-sub">
              A map-first platform connecting local signal, stories,
              and services.
            </p>
          </div>

          <div className="landing-actions">
            <button
              type="button"
              className="btn primary hero-cta"
              onClick={handleGuestEntry}
            >
              Continue as Guest
            </button>

            <div className="guest-pill">READ ONLY ACCESS</div>

            <p className="guest-mode-copy">
              Explore your local community in read-only mode. Create an
              account later to post, comment, and contribute.
            </p>
          </div>
        </section>
      </main>

      <button
        type="button"
        className="landing-login-thumb"
        onClick={openAuth}
        aria-label="Login"
        title="Login"
      >
        <img src="/logo/echo.png" alt="" />
      </button>

      {showAuth && (
        <CommunityPlusAuthModal
          onClose={closeAuth}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}