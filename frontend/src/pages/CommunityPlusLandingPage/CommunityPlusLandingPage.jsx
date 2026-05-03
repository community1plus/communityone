import { useState } from "react";
import { signIn } from "aws-amplify/auth";

import { useAuth } from "../../context/AuthContext";
import "./CommunityPlusLandingPage.css";

const AUTH_UI_ENABLED = false;

export default function CommunityPlusLandingPage() {
  const { login, loading } = useAuth();

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEntry = async () => {
    if (!AUTH_UI_ENABLED || authLoading) return;

    setAuthError("");
    setAuthLoading(true);

    try {
      await login();
    } catch (err) {
      console.error(err);
      setShowFallback(true);
      setAuthError("Unable to connect. Use email login.");
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    if (!AUTH_UI_ENABLED || authLoading) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      await signIn({
        username: email.trim(),
        password,
      });
    } catch (err) {
      setAuthError(err?.message || "Login failed");
      setAuthLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="cpl-root">
      <div className="landing-hero-bg" aria-hidden="true">
        <img src="/images/echo 2.png" alt="" className="landing-bg-image" />
        <img src="/logo/echo.png" alt="" className="landing-bg-logo" />

        <div className="landing-hero-tint" />
        <div className="landing-hero-focus" />
      </div>

      <main className="landing-container">
        <section className="landing-hero" aria-label="Community.One landing">
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
            {AUTH_UI_ENABLED ? (
              <button
                type="button"
                className="btn primary"
                onClick={handleEntry}
                disabled={authLoading}
              >
                {authLoading ? "Connecting..." : "Explore your local area"}
              </button>
            ) : (
              <p className="auth-maintenance-note">
                We’re updating the sign-in experience. Please check back soon.
              </p>
            )}
          </div>
        </section>
      </main>

      {AUTH_UI_ENABLED && showFallback && (
        <div className="cpl-modalOverlay">
          <form className="cpl-authModal" onSubmit={handleEmailLogin}>
            <h2>Sign In</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />

            <button type="submit" disabled={authLoading}>
              {authLoading ? "Signing in..." : "Sign In"}
            </button>

            {authError && <div className="error">{authError}</div>}
          </form>
        </div>
      )}

      {AUTH_UI_ENABLED && authLoading && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-box">Redirecting to secure login…</div>
        </div>
      )}
    </div>
  );
}