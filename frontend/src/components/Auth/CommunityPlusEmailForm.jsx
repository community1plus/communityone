import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function CommunityPlusEmailForm() {
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
        {authLoading ? "Signing in..." : "Sign in"}
      </button>

      {authError && <div className="error">{authError}</div>}
    </form>
  );
}