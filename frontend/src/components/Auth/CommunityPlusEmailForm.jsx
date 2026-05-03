import { useState } from "react";
import { signIn } from "aws-amplify/auth";

export default function CommunityPlusEmailForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await signIn({
        username: email.trim(),
        password,
      });
    } catch (err) {
      setError(err?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <form className="auth-email-form" onSubmit={handleEmailLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        autoComplete="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {error && <div className="error">{error}</div>}
    </form>
  );
}