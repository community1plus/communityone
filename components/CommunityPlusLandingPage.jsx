import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

/**
 * AuthGate
 * - Renders Amplify Authenticator with a custom header
 * - Calls onAuthed() once when a user is authenticated (guarded by parent)
 */
function AuthGate({ onAuthed }) {
  return (
    <Authenticator
      socialProviders={["google", "facebook"]}
      components={{
        Header() {
          return (
            <div className="cpl-authHeader">
              <div className="cpl-authBrand">Community One</div>
              <div className="cpl-authTagline">
                Local, real-time information for your community.
              </div>
            </div>
          );
        },
      }}
    >
      {({ user }) => {
        // IMPORTANT: never call navigation inside render
        // Use an effect to trigger once when user becomes available.
        React.useEffect(() => {
          if (user) onAuthed();
        }, [user]);

        return null;
      }}
    </Authenticator>
  );
}

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  // Prevent multiple navigations if Authenticator re-renders
  const didNavigateRef = useRef(false);

  const handleAuthed = () => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    setShowAuth(false);
    navigate("/home", { replace: true });
  };

  // Reset the nav-guard each time the modal opens
  useEffect(() => {
    if (showAuth) didNavigateRef.current = false;
  }, [showAuth]);

  // Close on Escape
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
              <button className="pill" type="button" title="Change location">
                <span className="dot" />
                <span>St Kilda, VIC</span>
                <span className="pillCaret" aria-hidden="true">
                  ▾
                </span>
              </button>
            </div>
          </div>

          <nav className="nav" aria-label="Primary">
            <a href="#">Home</a>
            <a href="#">Live</a>
            <a href="#">Events</a>
            <a href="#">Incidents</a>
            <a href="#">About</a>
          </nav>

          <div className="actions">
            {/* SIGN IN / JOIN */}
            <button className="btn signin" type="button" onClick={() => setShowAuth(true)}>
              Sign in
            </button>

            <button
              className="btn primary"
              type="button"
              onClick={() => setShowAuth(true)}
            >
              <strong>Join</strong>
            </button>

            <div className="avatar" title="Profile" aria-label="Profile">
              A
            </div>
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
                Short, time-bound posts.
              </p>

              <div className="heroCtas">
                <a className="btn primary" href="#">
                  <strong>Explore your local area</strong>
                </a>
                <a className="btn" href="#">
                  Global View
                </a>
                <a
                  className="btn"
                  href="#"
                  title="Incident reporting has higher verification"
                >
                  Report an incident
                </a>
              </div>

              <div className="meta" aria-label="Principles">
                <div className="chip">
                  <span className="badge">✓</span> <b>Place-first</b> map + feed
                </div>
                <div className="chip">
                  <span className="badge">⏱</span> <b>24-hour</b> revolving window
                </div>
                <div className="chip">
                  <span className="badge">◎</span> <b>Clear ads</b>
                </div>
              </div>
            </div>

            <aside className="preview" aria-label="App preview">
              <div className="pulsebar">
                <span className="pulse pulse-live">
                  <strong>LIVE</strong> <span className="sep">•</span> 2 gigs tonight
                </span>
                <span className="pulse pulse-alert">
                  <strong>ALERT</strong> <span className="sep">•</span> 1 unverified
                  incident
                </span>
                <span className="pulse pulse-events">
                  <strong>EVENTS</strong> <span className="sep">•</span> Weekend market
                </span>
              </div>

              <div className="preview-inner">
                <div className="feed">
                  <div className="pane-title">
                    <span>
                      <b>Feed</b> — Here
                    </span>
                    <span className="mono">3km</span>
                  </div>

                  <div className="card">
                    <div className="row">
                      <div className="icon">▶</div>
                      <div>
                        <p className="title">Band soundcheck at the Palais</p>
                        <p className="small">
                          <span>
                            <span className="pin" /> 420m • The Esplanade
                          </span>
                          <span>
                            <span className="time" /> 12 min ago
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="row">
                      <div className="icon">📰</div>
                      <div>
                        <p className="title">Parking changes on Acland St</p>
                        <p className="small">
                          <span>
                            <span className="pin" /> 1.1km • Acland St
                          </span>
                          <span>
                            <span className="time" /> 1 hr ago
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card ad">
                    <div className="row">
                      <div className="icon">Ⓢ</div>
                      <div>
                        <p className="title">Sponsored — Weekly local special</p>
                        <p className="small">
                          <span>
                            <span className="pin" /> In your area
                          </span>
                          <span>
                            <span className="time" /> This week
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card cardMuted">
                    <div className="row">
                      <div className="icon">⚠</div>
                      <div>
                        <p className="title">
                          Unverified: loud disturbance near Fitzroy St
                        </p>
                        <p className="small">
                          <span>
                            <span className="pin" /> 780m • Fitzroy St
                          </span>
                          <span>
                            <span className="time" /> 6 min ago
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="map">
                  <div className="pane-title">
                    <span>
                      <b>Map</b> - St Kilda
                    </span>
                    <span className="mono">Now</span>
                  </div>

                  <div className="mapbox" aria-label="Map placeholder">
                    <div
                      className="mappin"
                      style={{ left: "28%", top: "32%" }}
                      title="Band soundcheck"
                    />
                    <div
                      className="mappin teal"
                      style={{ left: "62%", top: "46%" }}
                      title="Parking update"
                    />
                    <div
                      className="mappin"
                      style={{ left: "48%", top: "66%" }}
                      title="Unverified incident"
                    />

                    <div className="maplabel">
                      Viewing: <b>St Kilda</b> • 3km radius
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="grid3">
            <div className="feature">
              <h3>Designed for clarity</h3>
              <p>
                Posts are time-bound and location-anchored so the feed stays relevant
                and readable. Less noise, more signal.
              </p>
            </div>

            <div className="feature">
              <h3>Accountable incident reporting</h3>
              <p>
                Safety reports are gated behind one-time verification and clear
                “unverified/confirmed” states to prevent abuse and panic.
              </p>
            </div>

            <div className="feature">
              <h3>Ads that don’t hijack attention</h3>
              <p>
                Sponsored posts live in dedicated slots with clear labels. No disguised
                promos. No interruptions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <div>© Community One — Local, time-bound, map-first.</div>
          <div className="mono">
            Theme: warm neutral + brick accent + deep teal (sparingly)
          </div>
        </div>
      </footer>

      {/* ============================
          AUTH MODAL (TIGHTENED)
         ============================ */}
      {showAuth && (
        <div
          className="cpl-modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Authentication"
          onMouseDown={(e) => {
            // close on backdrop click only
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="cpl-modal">
            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">Sign in</div>
              <button
                className="cpl-modalClose"
                type="button"
                onClick={() => setShowAuth(false)}
              >
                Close
              </button>
            </div>
            
            <div className="cpl-modalBody">
              {/* Scope Amplify UI skin to this modal only */}
              <div className="cpl-authTheme">
                <AuthGate onAuthed={handleAuthed} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
