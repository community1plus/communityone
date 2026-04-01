import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // 🔥 Prevent double execution (React strict mode + rerenders)
  const hasRun = useRef(false);

  useEffect(() => {
    // 🚫 Wait until auth fully resolves
    if (loading) return;

    // 🚫 No session → go back to landing
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    // 🚫 Prevent duplicate calls
    if (hasRun.current) return;
    hasRun.current = true;

    async function resolveUser() {
      try {
        console.log("🔍 AuthGate: checking user");

        const data = await apiFetch("/api/users/me");

        console.log("✅ AuthGate response:", data);

        if (!data.hasProfile) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }

      } catch (err) {
        console.error("❌ AuthGate error:", err);

        // fallback → reset flow
        navigate("/", { replace: true });
      }
    }

    resolveUser();
  }, [user, loading, navigate]);

  return <div>Loading...</div>;
}