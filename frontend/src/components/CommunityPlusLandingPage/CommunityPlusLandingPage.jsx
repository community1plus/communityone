import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const didNavigateRef = useRef(false);

  const handleAuthed = () => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    setShowAuth(false);
    navigate("/home", { replace: true });
  };

  useEffect(() => {
    if (showAuth) didNavigateRef.current = false;
  }, [showAuth]);

  useEffect(() => {
    if (!showAuth) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowAuth(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAuth]);

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
            <button className="btn signin" onClick={() => setShowAuth(true)}>
              Sign in
            </button>

            <button className="btn primary" onClick={() => setShowAuth(true)}>
              <strong>Join</strong>
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

      {/* AUTH MODAL */}
      {showAuth && (
        <div
          className="cpl-modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="cpl-modal">
            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">Sign in</div>
              <button onClick={() => setShowAuth(false)}>Close</button>
            </div>

            <div className="cpl-modalBody">
              <Authenticator>
                {({ user }) => {
                  // ✅ SAFE: only trigger once when user exists
                  useEffect(() => {
                    if (user) {
                      handleAuthed();
                    }
                  }, [user]);

                  return null;
                }}
              </Authenticator>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}