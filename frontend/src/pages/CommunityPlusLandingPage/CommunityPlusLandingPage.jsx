import React, { useState } from "react";
import "./CommunityPlusLandingPage.css";

import {
  signIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  signInWithRedirect,
} from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  /* ===============================
     ENTRY (PURE UI TRIGGER)
  =============================== */
  const handleEntry = () => {
    setAuthError("");
    setShowAuth(true);
  };

  /* ===============================
     EMAIL LOGIN
  =============================== */
  const handleEmailLogin = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await signIn({
        username: email.trim(),
        password,
      });

      // ✅ DO NOTHING
      // AuthProvider + routing will handle redirect
    } catch (err) {
      console.error("Email login failed:", err);
      setAuthError(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  /* ===============================
     SIGNUP
  =============================== */
  const handleSignup = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: {
            email: email.trim(),
          },
        },
      });

      setAuthMode("confirmSignup");
    } catch (err) {
      console.error("Signup failed:", err);
      setAuthError(err?.message || "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  /* ===============================
     CONFIRM SIGNUP
  =============================== */
  const handleConfirmSignup = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: confirmCode.trim(),
      });

      setAuthMode("login");
      setAuthError("Account verified. You can now sign in.");
    } catch (err) {
      console.error("Confirm signup failed:", err);
      setAuthError(err?.message || "Verification failed");
    } finally {
      setAuthLoading(false);
    }
  };

  /* ===============================
     FORGOT PASSWORD
  =============================== */
  const handleForgot = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await resetPassword({
        username: email.trim(),
      });

      setAuthMode("resetConfirm");
    } catch (err) {
      console.error("Reset password request failed:", err);
      setAuthError(err?.message || "Could not send reset code");
    } finally {
      setAuthLoading(false);
    }
  };

  /* ===============================
     RESET CONFIRM
  =============================== */
  const handleResetConfirm = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: confirmCode.trim(),
        newPassword: password,
      });

      setAuthMode("login");
      setAuthError("Password reset successful. You can now sign in.");
    } catch (err) {
      console.error("Password reset confirm failed:", err);
      setAuthError(err?.message || "Password reset failed");
    } finally {
      setAuthLoading(false);
    }
  };

  /* ===============================
     SOCIAL LOGIN
  =============================== */
  const handleSocial = async (provider) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await signInWithRedirect({ provider });
    } catch (err) {
      console.error(`${provider} login failed:`, err);
      setAuthError("Social login failed");
      setAuthLoading(false);
    }
  };

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

            <button className="btn primary" onClick={handleEntry}>
              Explore your local area
            </button>
          </div>

          <div className="echo-inline" onClick={handleEntry}>
            <img src="/logo/echo.png" alt="Echo" />
            <div className="echo-pulse"></div>
          </div>
        </div>

        <div className="content-section">
          <div className="map-box">
            <iframe
              title="St Kilda Map"
              src="https://www.google.com/maps?q=St+Kilda+Melbourne&output=embed"
              loading="lazy"
            />
          </div>

          <div className="feed">
            <div className="feed-card">
              <div className="feed-title">🚧 Road closure on Collins St</div>
              <div className="feed-meta">📍 Melbourne CBD • 120m away</div>
            </div>

            <div className="feed-card">
              <div className="feed-title">☕ New cafe opening</div>
              <div className="feed-meta">📍 Richmond • 350m away</div>
            </div>

            <div className="feed-card">
              <div className="feed-title">🚨 Police activity reported</div>
              <div className="feed-meta">📍 St Kilda • 220m away</div>
            </div>
          </div>
        </div>
      </main>

      {/* AUTH MODAL — unchanged */}
      {showAuth && (
        <div className="cpl-modalOverlay">
          {/* keep your modal exactly as-is */}
        </div>
      )}

      {authLoading && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-box">Signing you in…</div>
        </div>
      )}
    </div>
  );
}