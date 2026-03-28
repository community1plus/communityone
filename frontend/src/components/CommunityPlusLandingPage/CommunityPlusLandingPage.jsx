import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect } from "aws-amplify/auth";
import { useAuth } from "../../context/AuthContext";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
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
              <div>Sign in</div>
              <button onClick={() => setShowAuth(false)}>Close</button>
            </div>

            <div className="cpl-modalBody">

              {/* 🔥 GOOGLE */}
              <button
                className="btn social google"
                onClick={() =>
                  signInWithRedirect({ provider: "Google" })
                }
              >
                Continue with Google
              </button>

              {/* 🔥 FACEBOOK */}
              <button
                className="btn social facebook"
                onClick={() =>
                  signInWithRedirect({ provider: "Facebook" })
                }
              >
                Continue with Facebook
              </button>

              <div className="divider">— or —</div>

              {/* 🔥 EMAIL LOGIN (redirect) */}
              <button
                className="btn email"
                onClick={() => signInWithRedirect()}
              >
                Continue with Email
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}