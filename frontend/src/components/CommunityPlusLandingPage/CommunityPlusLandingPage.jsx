import React, { useEffect, useState } from "react";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function CommunityPlusLandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  /* ===============================
     MODAL SCROLL LOCK
  =============================== */

  useEffect(() => {
    if (showAuth) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showAuth]);

  /* ===============================
     HANDLE LOGIN COMPLETE
  =============================== */

  const handleAuthed = () => {
    window.location.href = "/home"; // keep simple + reliable
  };

  return (
    <div className="cpl-root">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="logo">COMMUNITY ONE</div>

          <div className="actions">
            <button className="btn signin" onClick={() => setShowAuth(true)}>
              Sign in
            </button>

            <button className="btn primary" onClick={() => setShowAuth(true)}>
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
          <div className="hero-grid">
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
          </div>
        </section>
      </main>

      {/* ===============================
          AUTH MODAL (PREMIUM)
      =============================== */}

      {showAuth && (
        <div
          className="cpl-modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="cpl-modal">
            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">Welcome back</div>
              <button onClick={() => setShowAuth(false)}>Close</button>
            </div>

            <div className="cpl-modalBody">

              <div className="auth-sub">
                Sign in to your local community
              </div>

              {/* 🔥 SOCIAL LOGIN */}
              <button
                className="auth-btn google"
                onClick={() => {
                  setAuthLoading(true);
                  setShowAuth(false);
                  signInWithRedirect({ provider: "Google" });
                }}
              >
                <span className="icon">G</span>
                Continue with Google
              </button>

              <button
                className="auth-btn facebook"
                onClick={() => {
                  setAuthLoading(true);
                  setShowAuth(false);
                  signInWithRedirect({ provider: "Facebook" });
                }}
              >
                <span className="icon">f</span>
                Continue with Facebook
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* 🔥 EMAIL LOGIN (INLINE — NO REDIRECT) */}
              <div className="auth-inline">
                <Authenticator initialState="signIn">
                  {({ user }) => {
                    if (user) {
                      handleAuthed();
                    }
                    return null;
                  }}
                </Authenticator>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===============================
          LOADING OVERLAY
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