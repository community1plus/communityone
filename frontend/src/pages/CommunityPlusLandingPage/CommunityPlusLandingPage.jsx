import React, { useEffect, useState } from "react";
import "./CommunityPlusLandingPage.css";

import {
  signIn,
  signUp,
  signInWithRedirect,
  getCurrentUser
} from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.body.classList.toggle("modal-open", showAuth);
  }, [showAuth]);

  /* ===============================
     SAFE LOGIN ENTRY
  =============================== */
  const handleEntry = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        window.location.href = "/home";
        return;
      }
    } catch {}

    setShowAuth(true);
  };

  /* ===============================
     EMAIL LOGIN (NO REDIRECT)
  =============================== */
  const handleEmailLogin = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await signIn({
        username: email,
        password: password
      });

      window.location.href = "/home";
    } catch (err) {
      setAuthError(err.message || "Login failed");
      setAuthLoading(false);
    }
  };

  /* ===============================
     SOCIAL LOGIN (OPTIONAL REDIRECT)
  =============================== */
  const handleSocial = async (provider) => {
    setAuthLoading(true);

    try {
      await signInWithRedirect({ provider });
    } catch (err) {
      setAuthError("Social login failed");
      setAuthLoading(false);
    }
  };

  return (
    <div className="cpl-root">
      <main className="main-full">

        {/* TITLE */}
        <div className="app-title">COMMUNITY ONE</div>

        {/* =========================
            HEADLINE + ECHO
        ========================= */}
        <div className="headline-row">

          <div className="headline-text">
            <h1 className="tagline">
              Real People. <span className="accent">Real News.</span> Real Time
            </h1>

            <p className="sub">
              A map-first local feed that prioritises what’s happening <b>here</b>.
            </p>

            <button className="btn primary" onClick={handleEntry}>
              Explore your local area
            </button>
          </div>

          {/* 🔥 ECHO = ENTRY */}
          <div className="echo-inline" onClick={handleEntry}>
            <img src="/logo/echo.png" alt="Echo" />
            <div className="echo-pulse"></div>
          </div>

        </div>

        {/* =========================
            MAP + FEED
        ========================= */}
        <div className="content-section">

          <div className="map-box">
            <iframe
              title="St Kilda Map"
              src="https://www.google.com/maps?q=St+Kilda+Melbourne&output=embed"
              loading="lazy"
            />
          </div>

          <div className="feed">

            <div className="feed-card">
              <div className="feed-title">🚧 Road closure on Collins St</div>
              <div className="feed-meta">📍 Melbourne CBD • 120m away</div>
            </div>

            <div className="feed-card">
              <div className="feed-title">☕ New cafe opening</div>
              <div className="feed-meta">📍 Richmond • 350m away</div>
            </div>

            <div className="feed-card">
              <div className="feed-title">🚨 Police activity reported</div>
              <div className="feed-meta">📍 St Kilda • 220m away</div>
            </div>

          </div>

        </div>

      </main>

      {/* =========================
          AUTH MODAL (UNIFIED)
      ========================= */}
      {showAuth && (
        <div className="cpl-modalOverlay">
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

              {/* EMAIL INPUT */}
              <input
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="auth-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button className="auth-btn email" onClick={handleEmailLogin}>
                Sign in with Email
              </button>

              {authError && (
                <div className="auth-error">{authError}</div>
              )}

              <div className="auth-divider"><span>or</span></div>

              {/* SOCIAL */}
              <button
                className="auth-btn google"
                onClick={() => handleSocial("Google")}
              >
                Continue with Google
              </button>

              <button
                className="auth-btn facebook"
                onClick={() => handleSocial("Facebook")}
              >
                Continue with Facebook
              </button>

            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
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