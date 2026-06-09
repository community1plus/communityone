import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import CommunityPlusAuthModal from "../../components/Auth/CommunityPlusAuthModal";

import "./CommunityPlusLandingPage.css";

const RETURN_TO_KEY = "communityone_return_to";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    loading,
    isAuthenticated,
    isGuest,
    continueAsGuest,
    logout,
  } = useAuth();

  const {
    profileReady,
    profileMissing,
    hasProfile,
    isProfileComplete,
  } = useProfile();

  const [showAuth, setShowAuth] = useState(false);

  const returnTo = useMemo(() => {
    return (
      location.state?.returnTo ||
      sessionStorage.getItem(RETURN_TO_KEY) ||
      "/communityplus"
    );
  }, [location.state]);

  useEffect(() => {
    if (location.state?.returnTo) {
      sessionStorage.setItem(RETURN_TO_KEY, location.state.returnTo);
    }

    if (location.state?.loginRequired && (!isAuthenticated || isGuest)) {
      setShowAuth(true);
    }
  }, [location.state, isAuthenticated, isGuest]);

  useEffect(() => {
    if (loading) return;
    if (isGuest) return;
    if (!isAuthenticated) return;
    if (!profileReady) return;

    const cameFromProtectedRoute =
      Boolean(location.state?.loginRequired) ||
      Boolean(sessionStorage.getItem(RETURN_TO_KEY));

    if (!cameFromProtectedRoute) {
      return;
    }

    const needsProfileSetup =
      profileMissing || !hasProfile || !isProfileComplete;

    if (needsProfileSetup) {
      navigate("/communityplus/welcome", {
        replace: true,
        state: {
          returnTo,
          profileRequired: true,
        },
      });
      return;
    }

    sessionStorage.removeItem(RETURN_TO_KEY);

    navigate(returnTo, {
      replace: true,
    });
  }, [
    loading,
    isGuest,
    isAuthenticated,
    profileReady,
    profileMissing,
    hasProfile,
    isProfileComplete,
    location.state,
    navigate,
    returnTo,
  ]);

  const openAuth = () => {
    if (isAuthenticated && !isGuest) {
      navigate("/communityplus", {
        replace: true,
      });
      return;
    }

    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleGuestEntry = async () => {
    await continueAsGuest();

    sessionStorage.removeItem(RETURN_TO_KEY);

    navigate("/communityplus", {
      replace: true,
    });
  };

  const handleSwitchAccount = async () => {
    sessionStorage.removeItem(RETURN_TO_KEY);
    localStorage.removeItem("community_guest");

    await logout();
  };

  if (loading || (isAuthenticated && !isGuest && !profileReady)) {
    return null;
  }

  return (
    <div className="cpl-root">
      <div className="landing-visual-layer" aria-hidden="true">
        <div className="landing-hero-tint" />
        <div className="landing-hero-focus" />
      </div>

      <main className="landing-container">
        <section className="landing-hero" aria-label="Community.One landing">
          <h1 className="brand-title">Community.One</h1>

          <div className="landing-text">
            <h2 className="landing-tagline">
              Real People. <span className="accent">Real News.</span> Real Time
            </h2>

            <p className="landing-sub">
              A map-first platform connecting local signal, stories, and
              services.
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

            {isAuthenticated && !isGuest && (
              <button
                type="button"
                className="btn secondary"
                onClick={handleSwitchAccount}
              >
                Switch account
              </button>
            )}

            <div className="guest-pill">READ ONLY ACCESS</div>

            <p className="guest-mode-copy">
              Explore your local community in read-only mode. Create an account
              later to post, comment, and contribute.
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
/**/