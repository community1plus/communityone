import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function CommunityPlusEmailForm({ onSuccess }) {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    if (authLoading) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      await signIn({
        username: email.trim(),
        password,
      });

      await refreshAuth({ forceRefresh: true });

      onSuccess?.();

      navigate("/communityplus", { replace: true });
    } catch (err) {
      setAuthError(err?.message || "Login failed");
      setAuthLoading(false);
    }
  };

  return (
    <form className="auth-email-form" onSubmit={handleEmailLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        autoComplete="email"
        disabled={authLoading}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        autoComplete="current-password"
        disabled={authLoading}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit" disabled={authLoading}>
        {authLoading ? "Signing in..." : "Sign in"}
      </button>

      {authLoading && (
        <div className="auth-inline-loading">
          Signing you in…
        </div>
      )}
      console.log("onSuccess:", onSuccess);  
      {authError && <div className="error">{authError}</div>}
    </form>
  );
}