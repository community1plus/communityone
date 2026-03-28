import React, { useEffect, useRef, useState } from "react";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function CommunityPlusLandingPage() {
const [showAuth, setShowAuth] = useState(false);
const [authLoading, setAuthLoading] = useState(false);
const [authedUser, setAuthedUser] = useState(null);

const didNavigateRef = useRef(false);

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
HANDLE LOGIN COMPLETE (SAFE)
=============================== */

useEffect(() => {
if (!authedUser) return;


if (didNavigateRef.current) return;
didNavigateRef.current = true;

window.location.href = "/home";


}, [authedUser]);

return ( <div className="cpl-root"> <header className="topbar"> <div className="wrap topbar-inner"> <div className="logo">COMMUNITY ONE</div>


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
      AUTH MODAL (STABLE)
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
          <div className="cpl-modalTitle">COMMUNITY ONE</div>
          <button
            className="cpl-closeBtn"
            onClick={() => setShowAuth(false)}
          >
            ×
          </button>
        </div>

        <div className="cpl-modalBody auth-grid">

          {/* LEFT: SOCIAL */}
          <div className="auth-left">
            <div className="auth-sub">
              Sign in to your local community
            </div>

            <button
              className="auth-btn google"
              onClick={() => {
                setAuthLoading(true);
                setShowAuth(false);
                signInWithRedirect({ provider: "Google" });
              }}
            >
              <span className="icon">G</span>
              Google
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
              Facebook
            </button>
          </div>

          {/* RIGHT: EMAIL */}
          <div className="auth-right">
            <div className="auth-inline">
              <Authenticator
                initialState="signIn"
                socialProviders={[]} // ✅ prevents duplicate buttons
              >
                {({ user }) => {
                  // 🔥 SAFE: move side effect OUT of render
                  useEffect(() => {
                    if (user) {
                      setAuthedUser(user);
                    }
                  }, [user]);

                  return null;
                }}
              </Authenticator>
            </div>
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
