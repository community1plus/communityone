import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function Onboarding() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit() {
    if (!username || !displayName) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch("/api/users/profile/create", {
        method: "POST",
        body: JSON.stringify({
          username,
          display_name: displayName
        })
      });

      // 🔥 SPA navigation (no reload)
      navigate("/home", { replace: true });

    } catch (err) {
      console.error("Profile creation failed:", err);
      setError("Failed to create profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboarding-container">

      <h2>Create your profile</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating..." : "Continue"}
      </button>

      {error && <p className="error">{error}</p>}

    </div>
  );
}