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
  const [confirmCode, setConfirmCode] = useState("");
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
      console.error("Google sign-in failed:", err);
      setError(err?.message || "Google sign-in failed.");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithRedirect({ provider: "Facebook" });
    } catch (err) {
      console.error("Facebook sign-in failed:", err);
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
      console.error("Join failed:", err);
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
        confirmationCode: confirmCode,
      });

      setMessage("Account confirmed. You can now sign in.");
      setMode("signin");
      setConfirmCode("");
      setPassword("");
    } catch (err) {
      console.error("Confirm join failed:", err);
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
      console.error("Password reset request failed:", err);
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
        confirmationCode: confirmCode,
        newPassword,
      });

      setMessage("Password reset. You can now sign in.");
      setMode("signin");
      setConfirmCode("");
      setNewPassword("");
    } catch (err) {
      console.error("Password reset failed:", err);
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
              <span className="social-label">Google</span>
            </button>

            <button
              type="button"
              className="social-login facebook"
              onClick={handleFacebookLogin}
            >
              <span className="social-label">Facebook</span>
            </button>

            <div className="auth-divider auth-divider-small" />

            <div className="auth-link-box" aria-label="Account actions">
              <button
                type="button"
                className="auth-box-link"
                onClick={() => goTo("join")}
              >
                Join
              </button>

              <button
                type="button"
                className="auth-box-link"
                onClick={() => goTo("forgot")}
              >
                Forgot Password
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
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Creating account..." : "Join Community One"}
            </button>

            <div className="auth-divider auth-divider-small" />

            <div className="auth-link-box">
              <button
                type="button"
                className="auth-box-link"
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
              value={confirmCode}
              onChange={(event) => setConfirmCode(event.target.value)}
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Confirming..." : "Confirm account"}
            </button>

            <div className="auth-divider auth-divider-small" />

            <div className="auth-link-box">
              <button
                type="button"
                className="auth-box-link"
                onClick={() => goTo("join")}
              >
                Back
              </button>
            </div>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Sending code..." : "Send reset code"}
            </button>

            <div className="auth-divider auth-divider-small" />

            <div className="auth-link-box">
              <button
                type="button"
                className="auth-box-link"
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
              value={confirmCode}
              onChange={(event) => setConfirmCode(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />

            <button type="submit" disabled={busy}>
              {busy ? "Resetting..." : "Reset password"}
            </button>

            <div className="auth-divider auth-divider-small" />

            <div className="auth-link-box">
              <button
                type="button"
                className="auth-box-link"
                onClick={() => goTo("signin")}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}