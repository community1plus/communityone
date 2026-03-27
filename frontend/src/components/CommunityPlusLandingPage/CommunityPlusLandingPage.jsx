import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";
import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const didNavigateRef = useRef(false);

  // ✅ Redirect once authenticated
  const handleAuthed = () => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    navigate("/home", { replace: true });
  };

  // ✅ Check if user already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) handleAuthed();
      } catch {
        // not signed in
      }
    };

    checkUser();
  }, []);

  return (
    <div className="cpl-root">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand">
            <div className="logo">COMMUNITY ONE</div>

            <div className="loc">
              <button className="pill" type="button">
                <span className="dot" />
                <span>St Kilda, VIC</span>
                <span className="pillCaret">▾</span>
              </button>
            </div>
          </div>

          <nav className="nav">
            <a href="#">Home</a>
            <a href="#">Live</a>
            <a href="#">Events</a>
            <a href="#">Incidents</a>
            <a href="#">About</a>
          </nav>

          <div className="actions">
            {/* ✅ Explicit providers (FIXES YOUR ERROR) */}
            <button
              className="btn signin"
              onClick={() =>
                signInWithRedirect({ provider: "Facebook" })
              }
            >
              Sign in with Facebook
            </button>

            <button
              className="btn primary"
              onClick={() =>
                signInWithRedirect({ provider: "Google" })
              }
            >
              <strong>Sign in with Google</strong>
            </button>

            <div className="avatar">A</div>
          </div>
        </div>
      </header>

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

              <div className="heroCtas">
                <button className="btn primary" onClick={handleAuthed}>
                  Explore your local area
                </button>
              </div>
            </div>

            <aside className="preview">
              <div className="pulsebar">
                <span className="pulse pulse-live">LIVE • 2 gigs tonight</span>
                <span className="pulse pulse-alert">ALERT • 1 incident</span>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <div>© Community One</div>
        </div>
      </footer>
    </div>
  );
}