import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import CommunityPlusAuthModal from "../../components/Auth/CommunityPlusAuthModal";

import "./CommunityPlusLandingPage.css";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();

  const { loading, isAuthenticated } = useAuth();

  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/communityplus", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const openAuth = () => {
    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
  };

  if (loading) return null;

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
              onClick={openAuth}
            >
              Enter your community
            </button>

            <p className="auth-maintenance-note">
              Sign-in experience currently being upgraded.
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
          onSuccess={closeAuth}
        />
      )}
    </div>
  );
}