import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // 🔥 Track last processed user (better than boolean)
  const lastUserRef = useRef(null);

  useEffect(() => {
    // 🚫 Wait until auth fully resolves
    if (loading) return;

    // 🚫 No session → go back to landing
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    // 🚫 Prevent duplicate calls for SAME user
    if (lastUserRef.current === user.userId) return;
    lastUserRef.current = user.userId;

    async function resolveUser() {
      try {
        console.log("🔍 AuthGate: checking user");

        // ✅ FIXED PATH
        const data = await apiFetch("/users/me");

        console.log("✅ AuthGate response:", data);

        if (!data.hasProfile) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }

      } catch (err) {
        console.error("❌ AuthGate error:", err);

        // 🔁 Allow retry if something failed
        lastUserRef.current = null;

        navigate("/", { replace: true });
      }
    }

    resolveUser();

  }, [user, loading, navigate]);

  return <div>Loading...</div>;
}