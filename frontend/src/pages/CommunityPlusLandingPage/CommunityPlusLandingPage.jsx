import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
    profile,
    profileReady,
    profileMissing,
    hasProfile,
    isProfileComplete,
  } = useProfile();

  console.log({
  profileReady,
  profileMissing,
  hasProfile,
  isProfileComplete,
});
  const [showAuth, setShowAuth] = useState(false);

  const returnTo = useMemo(() => {
    return (
      location.state?.returnTo ||
      sessionStorage.getItem(RETURN_TO_KEY) ||
      "/communityplus"
    );
  }, [location.state]);

const needsProfileSetup =
  profileReady &&
  !isGuest &&
  (!hasProfile || !isProfileComplete || profile === null);

  useEffect(() => {
    if (location.state?.returnTo) {
      sessionStorage.setItem(RETURN_TO_KEY, location.state.returnTo);
    }

    if (location.state?.openAuthModal) {
      setShowAuth(true);
    }

    if (location.state?.loginRequired && (!isAuthenticated || isGuest)) {
      setShowAuth(true);
    }
  }, [location.state, isAuthenticated, isGuest]);

useEffect(() => {
  if (loading) return;
  if (!isAuthenticated) return;
  if (isGuest) return;
  if (!profileReady) return;

  if (!hasProfile || !isProfileComplete || profile === null) {
    navigate("/communityplus/profile", {
      replace: true,
      state: {
        returnTo,
        profileRequired: true,
      },
    });

    return;
  }

  sessionStorage.removeItem(RETURN_TO_KEY);

  navigate(returnTo || "/communityplus", {
    replace: true,
  });
}, [
  loading,
  isAuthenticated,
  isGuest,
  profileReady,
  hasProfile,
  isProfileComplete,
  profile,
  navigate,
  returnTo,
]);

const handleAuthSuccess = () => {
  setShowAuth(false);

  window.location.replace("/communityplus/profile");
};

  const openAuth = () => {
    if (isAuthenticated && !isGuest) {
      if (profileReady && needsProfileSetup) {
        navigate("/communityplus/profile", {
          replace: true,
          state: {
            returnTo,
            profileRequired: true,
          },
        });
        return;
      }

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

    setShowAuth(true);
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
            {!isAuthenticated || isGuest ? (
              <>
                <button
                  type="button"
                  className="btn primary hero-cta"
                  onClick={handleGuestEntry}
                >
                  Continue as Guest
                </button>

              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn primary hero-cta"
                  onClick={openAuth}
                >
                  Continue
                </button>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleSwitchAccount}
                >
                  Switch account
                </button>
              </>
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