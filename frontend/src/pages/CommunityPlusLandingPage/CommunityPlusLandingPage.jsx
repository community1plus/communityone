import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import CommunityPlusAuthModal from "../../components/Auth/CommunityPlusAuthModal";

import "./CommunityPlusLandingPage.css";

export default function CommunityPlusLandingPage() {
  const { loading } = useAuth();

  const [showAuth, setShowAuth] = useState(false);

  const handleEntry = () => {
    setShowAuth(true);
  };

  if (loading) return null;

  return (
    <div className="cpl-root">
      {/* VISUAL LAYER */}
      <div className="landing-visual-layer" aria-hidden="true">
        <div className="landing-hero-tint" />
        <div className="landing-hero-focus" />
      </div>

      {/* MAIN CONTENT */}
      <main className="landing-container">
        <section className="landing-hero" aria-label="Community.One landing">
          <h1 className="brand-title">Community.One</h1>

          <div className="landing-text">
            <h2 className="landing-tagline">
              Real People. <span className="accent">Real News.</span> Real Time
            </h2>

            <p className="landing-sub">
              A map-first platform connecting local signal, stories, and services.
            </p>
          </div>

          <div className="landing-actions">
            <button
              type="button"
              className="btn primary hero-cta"
              onClick={handleEntry}
            >
              Enter your community
            </button>

            <p className="auth-maintenance-note">
              Sign-in experience currently being upgraded.
            </p>
          </div>
        </section>
      </main>

      {/* FLOATING LOGIN BUTTON */}
      <button
        type="button"
        className="landing-login-thumb"
        onClick={handleEntry}
        aria-label="Login"
        title="Login"
      >
        <img src="/logo/echo.png" alt="" />
      </button>

      {/* AUTH MODAL */}
      {showAuth && (
        <CommunityPlusAuthModal onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}