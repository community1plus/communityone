import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // 🔥 Track last processed user (prevents duplicate calls)
  const lastUserRef = useRef(null);

  useEffect(() => {
    // 🚫 Wait until auth resolves
    if (loading) return;

    // 🚫 No session → landing
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    // 🚫 Prevent duplicate calls for same user
    if (lastUserRef.current === user.userId) return;
    lastUserRef.current = user.userId;

    async function resolveUser() {
      try {
        console.log("🔍 AuthGate: checking user");

        const data = await apiFetch("/users/me");

        console.log("✅ AuthGate response:", data);

        // 🔥 KEY CHANGE — route INTO dashboard with view state
        if (!data.hasProfile) {
          navigate("/home", {
            replace: true,
            state: { view: "onboarding" }
          });
        } else {
          navigate("/home", { replace: true });
        }

      } catch (err) {
        console.error("❌ AuthGate error:", err);

        // 🔁 allow retry if failure
        lastUserRef.current = null;

        navigate("/", { replace: true });
      }
    }

    resolveUser();

  }, [user, loading, navigate]);

  return <div>Loading...</div>;
}