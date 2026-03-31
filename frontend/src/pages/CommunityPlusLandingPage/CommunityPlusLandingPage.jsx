import React, { useEffect, useState } from "react";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  /* ===============================
     SCROLL LOCK
  =============================== */
  useEffect(() => {
    document.body.classList.toggle("modal-open", showAuth);
  }, [showAuth]);

  /* ===============================
     SAFE LOGIN (SESSION SAFE)
  =============================== */
  const safeRedirect = async (provider) => {
    try {
      const user = await getCurrentUser();

      if (user) {
        window.location.href = "/home";
        return;
      }
    } catch {
      // not signed in → continue
    }

    setAuthLoading(true);
    setShowAuth(false);

    if (provider) {
      signInWithRedirect({ provider });
    } else {
      signInWithRedirect(); // Cognito email flow
    }
  };

  return (
    <div className="cpl-root">
      {/* ===============================
          HEADER
      =============================== */}
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="logo">COMMUNITY ONE</div>

          <div className="actions">
            <button
              className="btn signin"
              onClick={() => setShowAuth(true)}
            >
              Sign in
            </button>

            <button
              className="btn primary"
              onClick={() => setShowAuth(true)}
            >
              Join
            </button>
          </div>
        </div>
      </header>

      {/* ===============================
          HERO
      =============================== */}
      <main className="wrap">
        <section className="hero">
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
        </section>
      </main>

      {/* ===============================
          ELITE AUTH MODAL
      =============================== */}
      {showAuth && (
        <div
          className="cpl-modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="cpl-modal elite">

            {/* HEADER */}
            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">COMMUNITY ONE</div>

              <button
                className="cpl-closeBtn"
                onClick={() => setShowAuth(false)}
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="cpl-modalBody">

              <div className="auth-sub">
                Sign in to your local community
              </div>

              {/* GOOGLE */}
              <button
                className="auth-btn google"
                onClick={() => safeRedirect("Google")}
              >
                Continue with Google
              </button>

              {/* FACEBOOK */}
              <button
                className="auth-btn facebook"
                onClick={() => safeRedirect("Facebook")}
              >
                Continue with Facebook
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* EMAIL */}
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