import { useState } from "react";
import { signIn } from "aws-amplify/auth";

import { useAuth } from "../../context/AuthContext";

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

  const handleEmailLogin = async () => {
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
      <main className="landing-container">
        <h1 className="brand-title">Community.One</h1>

        <div className="landing-logo">
          <img src="/logo/echo.png" alt="Community.One" />
        </div>

        {AUTH_UI_ENABLED && (
          <div className="landing-actions">
            <button
              type="button"
              className="btn primary"
              onClick={handleEntry}
              disabled={authLoading}
            >
              {authLoading ? "Connecting..." : "Explore your local area"}
            </button>
          </div>
        )}

        {!AUTH_UI_ENABLED && (
          <p className="auth-maintenance-note">
            We’re updating the sign-in experience. Please check back soon.
          </p>
        )}
      </main>

      {AUTH_UI_ENABLED && showFallback && (
        <div className="cpl-modalOverlay">
          <div className="cpl-authModal">
            <h2>Sign In</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              type="button"
              onClick={handleEmailLogin}
              disabled={authLoading}
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </button>

            {authError && <div className="error">{authError}</div>}
          </div>
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