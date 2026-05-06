import { useRef, useState, useEffect } from "react";
import { signIn } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function CommunityPlusEmailForm({ onSuccess }) {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const isMountedRef = useRef(true);
  const submittingRef = useRef(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setAuthLoading(true);
    setAuthError("");

    try {
      const username = formData.email.trim();

      await signIn({
        username,
        password: formData.password,
      });

      await refreshAuth();

      onSuccess?.();

      navigate("/communityplus", { replace: true });
    } catch (err) {
      if (!isMountedRef.current) return;

      setAuthError(err?.message || "Login failed");
      setAuthLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <form className="auth-email-form" onSubmit={handleEmailLogin}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        autoComplete="email"
        disabled={authLoading}
        onChange={(event) => updateField("email", event.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        autoComplete="current-password"
        disabled={authLoading}
        onChange={(event) => updateField("password", event.target.value)}
      />

      <button type="submit" disabled={authLoading}>
        {authLoading ? "Signing in..." : "Sign in"}
      </button>

      {authLoading && (
        <div className="auth-inline-loading">Signing you in…</div>
      )}

      {authError && <div className="error">{authError}</div>}
    </form>
  );
}