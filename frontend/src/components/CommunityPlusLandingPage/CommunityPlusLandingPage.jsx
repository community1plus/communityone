import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect } from "aws-amplify/auth";
import { useAuth } from "../../context/AuthContext";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const didNavigateRef = useRef(false);

  const handleAuthed = () => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;

    document.body.classList.remove("modal-open");
    setShowAuth(false);

    navigate("/home", { replace: true });
  };

  /* ===============================
     AUTO REDIRECT AFTER LOGIN
  =============================== */

  useEffect(() => {
    if (!loading && user) {
      handleAuthed();
    }
  }, [user, loading]);

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

  if (loading) return null;

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
          CUSTOM AUTH MODAL
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

              {/* 🔥 GOOGLE */}
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

              {/* 🔥 FACEBOOK */}
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

              {/* 🔥 EMAIL LOGIN */}
              <button
                className="auth-btn email"
                onClick={() => {
                  setAuthLoading(true);
                  setShowAuth(false);
                  signInWithRedirect();
                }}
              >
                Continue with Email
              </button>

            </div>
          </div>
        </div>
      )}

      {/* 🔥 OPTIONAL: GLOBAL LOADING STATE */}
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