import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

import CommunityPlusAuthModal from "../../components/Auth/CommunityPlusAuthModal";

import "./CommunityPlusLandingPage.css";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();

  const {
    loading,
    isAuthenticated,
    continueAsGuest,
  } = useAuth();

  const {
    profileReady,
    profileMissing,
    hasProfile,
    isProfileComplete,
  } = useProfile();

  const [showAuth, setShowAuth] = useState(false);

  /* ======================================================
     AUTHENTICATED REDIRECT
  ====================================================== */

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;
    if (!profileReady) return;

    const needsProfileSetup =
      profileMissing ||
      !hasProfile ||
      !isProfileComplete;

    if (needsProfileSetup) {
      navigate("/communityplus/welcome", {
        replace: true,
      });

      return;
    }

    navigate("/communityplus", {
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
  ]);

  /* ======================================================
     AUTH MODAL
  ====================================================== */

  const openAuth = () => {
    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
  };

  const handleAuthSuccess = () => {
    closeAuth();

    /*
      Redirect is handled by the authenticated redirect effect above.
      This allows ProfileContext to decide whether the user goes to:
      - /communityplus/welcome
      - /communityplus
    */
  };

  /* ======================================================
     GUEST ENTRY
  ====================================================== */

  const handleGuestEntry = () => {
    continueAsGuest();

    navigate("/communityplus");
  };

  /* ======================================================
     LOADING
  ====================================================== */

  if (loading || (isAuthenticated && !profileReady)) {
    return null;
  }

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="cpl-root">
      {/* ============================================
          VISUAL LAYER
      ============================================ */}

      <div
        className="landing-visual-layer"
        aria-hidden="true"
      >
        <div className="landing-hero-tint" />
        <div className="landing-hero-focus" />
      </div>

      {/* ============================================
          HERO
      ============================================ */}

      <main className="landing-container">
        <section
          className="landing-hero"
          aria-label="Community.One landing"
        >
          {/* BRAND */}

          <h1 className="brand-title">
            Community.One
          </h1>

          {/* COPY */}

          <div className="landing-text">
            <h2 className="landing-tagline">
              Real People.{" "}
              <span className="accent">
                Real News.
              </span>{" "}
              Real Time
            </h2>

            <p className="landing-sub">
              A map-first platform connecting local signal,
              stories, and services.
            </p>
          </div>

          {/* ACTIONS */}

          <div className="landing-actions">
            <button
              type="button"
              className="btn primary hero-cta"
              onClick={handleGuestEntry}
            >
              Continue as Guest
            </button>

            <button
              type="button"
              className="landing-secondary-auth"
              onClick={openAuth}
            >
              Sign In
            </button>

            <div className="guest-pill">
              READ ONLY ACCESS
            </div>

            <p className="guest-mode-copy">
              Explore your local community in read-only mode.
              Create an account later to post, comment, and contribute.
            </p>
          </div>
        </section>
      </main>

      {/* ============================================
          FLOATING AUTH BUTTON
      ============================================ */}

      <button
        type="button"
        className="landing-login-thumb"
        onClick={openAuth}
        aria-label="Login"
        title="Login"
      >
        <img
          src="/logo/echo.png"
          alt=""
        />
      </button>

      {/* ============================================
          AUTH MODAL
      ============================================ */}

      {showAuth && (
        <CommunityPlusAuthModal
          onClose={closeAuth}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}