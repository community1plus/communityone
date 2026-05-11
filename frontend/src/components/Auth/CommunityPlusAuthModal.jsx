import { useState } from "react";
import {
  signInWithRedirect,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";

import CommunityPlusEmailForm from "./CommunityPlusEmailForm";
import "./CommunityPlusAuthModal.css";

export default function CommunityPlusAuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearStatus = () => {
    setMessage("");
    setError("");
  };

  const goTo = (nextMode) => {
    clearStatus();
    setMode(nextMode);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (err) {
      setError(err?.message || "Google sign-in failed.");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithRedirect({ provider: "Facebook" });
    } catch (err) {
      setError(err?.message || "Facebook sign-in failed.");
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    clearStatus();
    setBusy(true);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      });

      setMessage("Check your email for the confirmation code.");
      setMode("confirmJoin");
    } catch (err) {
      setError(err?.message || "Could not create account.");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmJoin = async (event) => {
    event.preventDefault();
    clearStatus();
    setBusy(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      setMessage("Account confirmed. You can now sign in.");
      setMode("signin");
      setCode("");
      setPassword("");
    } catch (err) {
      setError(err?.message || "Could not confirm account.");
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    clearStatus();
    setBusy(true);

    try {
      await resetPassword({ username: email });

      setMessage("Check your email for the reset code.");
      setMode("resetPassword");
    } catch (err) {
      setError(err?.message || "Could not start password reset.");
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    clearStatus();
    setBusy(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });

      setMessage("Password reset. You can now sign in.");
      setMode("signin");
      setCode("");
      setNewPassword("");
    } catch (err) {
      setError(err?.message || "Could not reset password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cpl-modalOverlay" onClick={onClose}>
      <div className="cpl-authModal" onClick={(e) => e.stopPropagation()}>
        <h2>Community One</h2>

        {mode === "signin" && (
          <>
            <CommunityPlusEmailForm onSuccess={onSuccess} />

            <div className="auth-divider">or</div>

            <button
              type="button"
              className="social-login google"
              onClick={handleGoogleLogin}
            >
              <span className="social-brand-icon google-brand" aria-hidden="true">
                G
              </span>
              <span className="social-label">Google</span>
            </button>

            <button
              type="button"
              className="social-login facebook"
              onClick={handleFacebookLogin}
            >
              <span
                className="social-brand-icon facebook-brand"
                aria-hidden="true"
              >
                f
              </span>
              <span className="social-label">Facebook</span>
            </button>

            <div className="auth-links">
              <button
                type="button"
                className="auth-text-link"
                onClick={() => goTo("join")}
              >
                Join
              </button>

              <span className="auth-link-divider">•</span>

              <button
                type="button"
                className="auth-text-link"
                onClick={() => goTo("forgot")}
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Creating account..." : "Join"}
            </button>

            <div className="auth-links">
              <button
                type="button"
                className="auth-text-link"
                onClick={() => goTo("signin")}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {mode === "confirmJoin" && (
          <form onSubmit={handleConfirmJoin}>
            <input
              type="text"
              placeholder="Confirmation code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Confirming..." : "Confirm account"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Sending code..." : "Send reset code"}
            </button>

            <div className="auth-links">
              <button
                type="button"
                className="auth-text-link"
                onClick={() => goTo("signin")}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {mode === "resetPassword" && (
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Reset code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}