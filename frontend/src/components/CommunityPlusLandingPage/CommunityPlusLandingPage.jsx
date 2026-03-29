import React, { useEffect, useRef, useState } from "react";
import "./CommunityPlusLandingPage.css";

import {
signInWithRedirect,
getCurrentUser,
} from "aws-amplify/auth";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

/* ===============================
🔥 SAFE AUTH LISTENER
=============================== */

function AuthListener({ user, onAuth }) {
useEffect(() => {
if (user) {
onAuth(user);
}
}, [user, onAuth]);

return null;
}

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
🚀 REDIRECT AFTER LOGIN
=============================== */

useEffect(() => {
if (!authedUser) return;


if (didNavigateRef.current) return;
didNavigateRef.current = true;

window.location.href = "/home";


}, [authedUser]);

/* ===============================
🔥 SAFE LOGIN HANDLER (KEY FIX)
=============================== */

const safeRedirect = async (provider) => {
try {
const user = await getCurrentUser();


  // ✅ Already signed in → go straight to dashboard
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
  signInWithRedirect();
}


};

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
      AUTH MODAL
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

        <div className="cpl-modalBody auth-grid">

          {/* LEFT: SOCIAL */}
          <div className="auth-left">
            <div className="auth-sub">
              Sign in to your local community
            </div>

            <button
              className="auth-btn google"
              onClick={() => safeRedirect("Google")}
            >
              <span className="icon">G</span>
              Continue with Google
            </button>

            <button
              className="auth-btn facebook"
              onClick={() => safeRedirect("Facebook")}
            >
              <span className="icon">f</span>
              Continue with Facebook
            </button>
          </div>

          {/* RIGHT: EMAIL */}
          <div className="auth-right">
            <div className="auth-inline">

              <Authenticator
                initialState="signIn"
                socialProviders={[]} // ✅ prevents duplication
              >
                {({ user }) => (
                  <AuthListener user={user} onAuth={setAuthedUser} />
                )}
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
