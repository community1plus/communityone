import React, { useEffect, useState } from "react";
import "./CommunityPlusLandingPage.css";

import {
  signIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  signInWithRedirect,
  getCurrentUser
} from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  useEffect(() => {
    document.body.classList.toggle("modal-open", showAuth);
  }, [showAuth]);

  /* ===============================
     ENTRY (ECHO / BUTTON)
  =============================== */
  const handleEntry = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        window.location.href = "/home";
        return;
      }
    } catch {}

    setShowAuth(true);
  };

  /* ===============================
     LOGIN
  =============================== */
  const handleEmailLogin = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await signIn({
        username: email,
        password
      });

      window.location.href = "/home";
    } catch (err) {
      setAuthError(err.message || "Login failed");
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
        username: email,
        password,
        options: {
          userAttributes: { email }
        }
      });

      setAuthMode("confirmSignup");
      setAuthLoading(false);
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  /* ===============================
     CONFIRM SIGNUP
  =============================== */
  const handleConfirmSignup = async () => {
    setAuthLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmCode
      });

      setAuthMode("login");
      setAuthLoading(false);
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  /* ===============================
     FORGOT PASSWORD
  =============================== */
  const handleForgot = async () => {
    setAuthLoading(true);

    try {
      await resetPassword({ username: email });
      setAuthMode("resetConfirm");
      setAuthLoading(false);
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  /* ===============================
     RESET CONFIRM
  =============================== */
  const handleResetConfirm = async () => {
    setAuthLoading(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: confirmCode,
        newPassword: password
      });

      setAuthMode("login");
      setAuthLoading(false);
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  /* ===============================
     SOCIAL LOGIN
  =============================== */
  const handleSocial = async (provider) => {
    setAuthLoading(true);

    try {
      await signInWithRedirect({ provider });
    } catch {
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

          {/* ECHO */}
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

      {/* =========================
          AUTH MODAL
      ========================= */}
      {showAuth && (
        <div className="cpl-modalOverlay">
          <div className="cpl-modal elite">

            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">COMMUNITY ONE</div>
              <button
                className="cpl-closeBtn"
                onClick={() => setShowAuth(false)}
              >
                ×
              </button>
            </div>

            <div className="cpl-modalBody">

              <div className="auth-sub">
                {authMode === "login" && "Sign in to your local community"}
                {authMode === "signup" && "Create your account"}
                {authMode === "forgot" && "Reset your password"}
                {authMode === "confirmSignup" && "Enter verification code"}
                {authMode === "resetConfirm" && "Enter code & new password"}
              </div>

              <input
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {authMode !== "forgot" && authMode !== "confirmSignup" && (
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}

              {(authMode === "confirmSignup" || authMode === "resetConfirm") && (
                <input
                  className="auth-input"
                  placeholder="Verification code"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                />
              )}

              {authMode === "login" && (
                <button className="auth-btn email" onClick={handleEmailLogin}>
                  Sign in with Email
                </button>
              )}

              {authMode === "signup" && (
                <button className="auth-btn email" onClick={handleSignup}>
                  Create account
                </button>
              )}

              {authMode === "confirmSignup" && (
                <button className="auth-btn email" onClick={handleConfirmSignup}>
                  Verify account
                </button>
              )}

              {authMode === "forgot" && (
                <button className="auth-btn email" onClick={handleForgot}>
                  Send reset code
                </button>
              )}

              {authMode === "resetConfirm" && (
                <button className="auth-btn email" onClick={handleResetConfirm}>
                  Reset password
                </button>
              )}

              {authError && <div className="auth-error">{authError}</div>}

              <div className="auth-links">
                {authMode === "login" && (
                  <>
                    <span onClick={() => setAuthMode("forgot")}>
                      Forgot password?
                    </span>
                    <span onClick={() => setAuthMode("signup")}>
                      Join
                    </span>
                  </>
                )}

                {(authMode === "signup" || authMode === "forgot") && (
                  <span onClick={() => setAuthMode("login")}>
                    Back to login
                  </span>
                )}
              </div>

              {authMode === "login" && (
                <>
                  <div className="auth-divider"><span>or</span></div>

                  <button
                    className="auth-btn google"
                    onClick={() => handleSocial("Google")}
                  >
                    Continue with Google
                  </button>

                  <button
                    className="auth-btn facebook"
                    onClick={() => handleSocial("Facebook")}
                  >
                    Continue with Facebook
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

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