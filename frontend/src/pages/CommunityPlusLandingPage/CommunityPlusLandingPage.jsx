import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusLandingPage.css";

import { signIn } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hasNavigated = useRef(false);

  /* ===============================
     🔥 AUTO-REDIRECT (ALIGNED)
  =============================== */
  useEffect(() => {
    if (!loading && isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;

      console.log("✅ Authenticated → CommunityPlusDashboard");

      setTimeout(() => {
        navigate("/CommunityPlusDashboard", { replace: true });
      }, 100);
    }
  }, [loading, isAuthenticated, navigate]);

  /* ===============================
     🔥 PRIMARY LOGIN
  =============================== */
  const handleEntry = async () => {
    if (authLoading) return;

    console.log("🚀 LOGIN CLICKED");

    setAuthError("");
    setAuthLoading(true);

    try {
      await login();
    } catch (err) {
      console.error("❌ Redirect failed:", err);

      setShowFallback(true);
      setAuthError("Unable to connect. Use email login.");
      setAuthLoading(false);
    }
  };

  /* ===============================
     🔥 FALLBACK EMAIL LOGIN
  =============================== */
  const handleEmailLogin = async () => {
    if (authLoading) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await signIn({
        username: email.trim(),
        password,
      });

      console.log("✅ Email login success:", res);

      // 🔥 HARD REDIRECT (aligned)
      setTimeout(() => {
        window.location.href = "/CommunityPlusDashboard";
      }, 150);

    } catch (err) {
      console.error("❌ Email login failed:", err);
      setAuthError(err?.message || "Login failed");
      setAuthLoading(false);
    }
  };

  /* ===============================
     🚧 BLOCK UNTIL AUTH READY
  =============================== */
  if (loading) return null;

  return (
    <div className="cpl-root">
      <main className="main-full">

        <div className="app-title">COMMUNITY ONE</div>

        <div className="headline-row">
          <div className="headline-text">
            <h1 className="tagline">
              Real People. <span className="accent">Real News.</span> Real Time
            </h1>

            <p className="sub">
              A map-first local feed that prioritises what’s happening <b>here</b>.
            </p>

            <button
              className="btn primary"
              onClick={handleEntry}
              disabled={authLoading}
            >
              {authLoading ? "Connecting..." : "Explore your local area"}
            </button>
          </div>

          <div
            className="echo-inline"
            onClick={handleEntry}
            style={{ cursor: "pointer" }}
          >
            <img src="/logo/echo.png" alt="Echo" />
            <div className="echo-pulse"></div>
          </div>
        </div>
      </main>

      {/* ===============================
         🔥 FALLBACK LOGIN
      =============================== */}
      {showFallback && (
        <div className="cpl-modalOverlay">
          <div className="cpl-authModal">
            <h2>Sign In</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleEmailLogin}
              disabled={authLoading}
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </button>

            {authError && <div className="error">{authError}</div>}
          </div>
        </div>
      )}

      {/* ===============================
         🔥 LOADING OVERLAY
      =============================== */}
      {authLoading && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-box">
            Redirecting to secure login…
          </div>
        </div>
      )}
    </div>
  );
}