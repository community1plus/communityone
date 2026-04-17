import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";

import {
  signIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  signInWithRedirect,
  fetchAuthSession,
} from "aws-amplify/auth";

import { Hub } from "aws-amplify/utils";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();

  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  /* ===============================
     AUTH LISTENER
  =============================== */
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload?.event === "signedIn") {
        navigate("/auth-gate", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ===============================
     CHECK SESSION ON LOAD
  =============================== */
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();

        if (!isMounted) return;

        if (session?.tokens?.idToken) {
          navigate("/auth-gate", { replace: true });
        }
      } catch (err) {
        console.warn("No active session on landing page:", err);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  /* ===============================
     ENTRY
  =============================== */
  const handleEntry = async () => {
    setAuthError("");

    try {
      const session = await fetchAuthSession();

      if (session?.tokens?.idToken) {
        navigate("/auth-gate", { replace: true });
        return;
      }
    } catch (err) {
      console.warn("No active session on entry:", err);
    }

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

      navigate("/auth-gate", { replace: true });
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

      {showAuth && (
        <div className="cpl-modalOverlay">
          <div className="cpl-modal elite">
            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">COMMUNITY ONE</div>
              <button
                className="cpl-closeBtn"
                onClick={() => {
                  if (!authLoading) {
                    setShowAuth(false);
                    setAuthError("");
                  }
                }}
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
                {authMode === "resetConfirm" && "Enter code and new password"}
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
                <button
                  className="auth-btn email"
                  onClick={handleEmailLogin}
                  disabled={authLoading}
                >
                  Sign in with Email
                </button>
              )}

              {authMode === "signup" && (
                <button
                  className="auth-btn email"
                  onClick={handleSignup}
                  disabled={authLoading}
                >
                  Create account
                </button>
              )}

              {authMode === "confirmSignup" && (
                <button
                  className="auth-btn email"
                  onClick={handleConfirmSignup}
                  disabled={authLoading}
                >
                  Verify account
                </button>
              )}

              {authMode === "forgot" && (
                <button
                  className="auth-btn email"
                  onClick={handleForgot}
                  disabled={authLoading}
                >
                  Send reset code
                </button>
              )}

              {authMode === "resetConfirm" && (
                <button
                  className="auth-btn email"
                  onClick={handleResetConfirm}
                  disabled={authLoading}
                >
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

                {(authMode === "signup" || authMode === "forgot" || authMode === "resetConfirm" || authMode === "confirmSignup") && (
                  <span
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                  >
                    Back to login
                  </span>
                )}
              </div>

              {authMode === "login" && (
                <>
                  <div className="auth-divider">
                    <span>or</span>
                  </div>

                  <button
                    className="auth-btn google"
                    onClick={() => handleSocial("Google")}
                    disabled={authLoading}
                  >
                    Continue with Google
                  </button>

                  <button
                    className="auth-btn facebook"
                    onClick={() => handleSocial("Facebook")}
                    disabled={authLoading}
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
          <div className="auth-loading-box">Signing you in…</div>
        </div>
      )}
    </div>
  );
}