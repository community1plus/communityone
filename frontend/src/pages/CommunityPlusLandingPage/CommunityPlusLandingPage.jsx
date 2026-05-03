<div className="cpl-root">
  {/* ================= BACKGROUND ================= */}
  <div className="landing-hero-bg" aria-hidden="true">
    
    {/* 🔥 base scene (REQUIRED) */}
    <img
      src="/images/echo 2.png"
      alt=""
      className="landing-bg-image"
    />

    {/* 🔥 subtle logo overlay */}
    <img
      src="/logo/echo.png"
      alt=""
      className="landing-bg-logo"
    />

    <div className="landing-hero-tint" />
    <div className="landing-hero-focus" />
  </div>

  {/* ================= CONTENT ================= */}
  <main className="landing-container">
    <section className="landing-hero">
      <h1 className="brand-title">Community.One</h1>

      <div className="landing-text">
        <h2 className="landing-tagline">
          Real People. <span className="accent">Real News.</span> Real Time
        </h2>

        <p className="landing-sub">
          A map-first local feed that prioritises what’s happening{" "}
          <strong>here</strong>.
        </p>
      </div>

      <div className="landing-actions">
        {!AUTH_UI_ENABLED && (
          <p className="auth-maintenance-note">
            We’re updating the sign-in experience. Please check back soon.
          </p>
        )}
      </div>
    </section>
  </main>
</div>