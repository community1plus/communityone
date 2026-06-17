import { useEffect, useRef, useState } from "react";
import {
  signIn,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";
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

  const resetSubmitState = () => {
    if (!isMountedRef.current) return;

    setAuthLoading(false);
    submittingRef.current = false;
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    const username = formData.email.trim();
    const password = formData.password;

    if (!username || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    submittingRef.current = true;
    setAuthLoading(true);
    setAuthError("");

    try {
      const signInResult = await signIn({
        username,
        password,
      });

      console.log("EMAIL SIGN IN RESULT:", signInResult);

      if (!signInResult?.isSignedIn) {
        const nextStep =
          signInResult?.nextStep?.signInStep ||
          "UNKNOWN_STEP";

        throw new Error(
          `Sign in requires another step: ${nextStep}`
        );
      }

      const currentUser = await getCurrentUser();

      const session = await fetchAuthSession({
        forceRefresh: true,
      });

      console.log("SIGNED IN USER:", currentUser);
      console.log("SIGNED IN SESSION:", session);

      if (!session.tokens?.accessToken) {
        throw new Error(
          "Signed in, but no access token was found."
        );
      }

      await refreshAuth({
        forceRefresh: true,
      });

      if (typeof onSuccess === "function") {
        onSuccess();
      }

      navigate("/communityplus/auth/resolve", {
        replace: true,
      });
    } catch (err) {
      console.error("Email login failed:", err);

      if (!isMountedRef.current) return;

      setAuthError(err?.message || "Login failed");
      resetSubmitState();
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
        <div className="auth-inline-loading">
          Signing you in…
        </div>
      )}

      {authError && <div className="error">{authError}</div>}
    </form>
  );
}