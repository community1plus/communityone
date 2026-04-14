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

      <main className="main-full">

        {/* TITLE */}
        <div className="app-title">COMMUNITY ONE</div>

        {/* =========================
            RIGHT PANEL (NOW MAIN CONTENT)
        ========================= */}
        <section className="right-panel">

          {/* TOP ROW: ECHO + MAP */}
          <div className="top-row">

            {/* 🔥 ECHO LEFT OF MAP */}
            <div
              className="echo-inline"
              onClick={() => setShowAuth(true)}
            >
              <img src="/logo/echo.png" alt="Echo" />
              <div className="echo-pulse"></div>
            </div>

            {/* 🔥 REAL MAP (ST KILDA) */}
            <div className="map-box">
              <iframe
                title="St Kilda Map"
                src="https://www.google.com/maps?q=St+Kilda+Melbourne&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

          {/* =========================
              FEED (STACKED CARDS)
          ========================= */}
          <div className="feed">

            <div className="feed-card">
              <div className="feed-title">
                🚧 Road closure on Collins St
              </div>
              <div className="feed-meta">
                📍 Melbourne CBD • 120m away
              </div>
            </div>

            <div className="feed-card">
              <div className="feed-title">
                ☕ New cafe opening
              </div>
              <div className="feed-meta">
                📍 Richmond • 350m away
              </div>
            </div>

            <div className="feed-card">
              <div className="feed-title">
                🚨 Police activity reported
              </div>
              <div className="feed-meta">
                📍 St Kilda • 220m away
              </div>
            </div>

          </div>

        </section>
      </main>

      {/* AUTH MODAL */}
      {showAuth && (
        <div
          className="cpl-modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="cpl-modal elite">

            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">
                COMMUNITY ONE
              </div>

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