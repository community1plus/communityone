import React, { useEffect, useState } from "react";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showAuth);
  }, [showAuth]);

  const safeRedirect = async (provider) => {
    try {
      const user = await getCurrentUser();
      if (user) {
        window.location.href = "/home";
        return;
      }
    } catch {}

    setAuthLoading(true);
    setShowAuth(false);

    if (provider) {
      signInWithRedirect({ provider });
    } else {
      signInWithRedirect();
    }
  };

  return (
    <div className="cpl-root">
      {/* ===============================
          HEADER
      =============================== */}
      <header className="topbar">
        <div className="wrap topbar-inner">

          {/* 🔥 LEFT LOGO (click = login) */}
          <img
            src="/logo/echo.png"
            alt="Echo"
            className="header-logo"
            onClick={() => setShowAuth(true)}
          />

          {/* 🔥 CENTER TITLE */}
          <div className="logo center-title">
            COMMUNITY ONE
          </div>

        </div>
      </header>

      {/* ===============================
          HERO
      =============================== */}
      <main className="wrap">
        <section className="hero split">

          {/* LEFT CONTENT */}
          <div className="headline">
            <h1 className="tagline">
              Real People. <span className="accent">Real News.</span> Real Time
            </h1>

            <p className="sub">
              A map-first local feed that prioritises what’s happening <b>here</b>.
            </p>

            <button
              className="btn primary"
              onClick={() => setShowAuth(true)}
            >
              Explore your local area
            </button>
          </div>

          {/* 🔥 RIGHT SIDE (ANIMATED LOGO) */}
          <div className="hero-visual">
            <div className="echo-animated">
              <img src="/logo/echo.png" alt="Echo Animated" />
              <div className="echo-pulse"></div>
            </div>
          </div>

        </section>
      </main>

      {/* ===============================
          AUTH MODAL
      =============================== */}
      {showAuth && (
        <div
          className="cpl-modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="cpl-modal elite">

            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">COMMUNITY ONE</div>
              <button
                className="cpl-closeBtn"
                onClick={() => setShowAuth(false)}
              >
                ×
              </button>
            </div>

            <div className="cpl-modalBody">
              <div className="auth-sub">
                Sign in to your local community
              </div>

              <button
                className="auth-btn google"
                onClick={() => safeRedirect("Google")}
              >
                Continue with Google
              </button>

              <button
                className="auth-btn facebook"
                onClick={() => safeRedirect("Facebook")}
              >
                Continue with Facebook
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button
                className="auth-btn email"
                onClick={() => safeRedirect()}
              >
                Continue with Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===============================
          LOADING
      =============================== */}
      {authLoading && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-box">
            Signing you in…
          </div>
        </div>
      )}
    </div>
  );
}