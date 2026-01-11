import React from "react";
import "./src/CommunityPlusLandingPage.css";

export default function CommunityPlusLandingPage() {
  return (
    <div className="cpl-root">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand">
            <div className="logo">
              COMMUNITY<span>+</span>
            </div>

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
            <a className="btn" href="#">
              Sign in
            </a>
            <a className="btn primary" href="#">
              <strong>Join</strong>
            </a>
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
                Real people. <span className="accent">Real News.</span> Realtime
              </h1>

              <p className="sub">
                A map-first local feed that prioritises what’s happening <b>here</b>.
                Short, time-bound posts. Clear labels.
              </p>

              <div className="heroCtas">
                <a className="btn primary" href="#">
                  <strong>Explore your area</strong>
                </a>
                <a className="btn" href="#">
                  See Global View
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
                <span className="pulse">
                  <strong>LIVE</strong> <span className="sep">•</span> 2 gigs tonight
                </span>
                <span className="pulse">
                  <strong>ALERT</strong> <span className="sep">•</span> 1 unverified
                  incident
                </span>
                <span className="pulse">
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
                      <b>Map</b> — St Kilda
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
          <div>© Community+ — Local, time-bound, map-first.</div>
          <div className="mono">
            Theme: warm neutral + brick accent + deep teal (sparingly)
          </div>
        </div>
      </footer>
    </div>
  );
}
