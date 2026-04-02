import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, loading, setAppUser } = useAuth();

  // 🔥 Prevent duplicate calls per session
  const lastUserRef = useRef(null);

  useEffect(() => {
    // 🚫 Wait for auth to resolve
    if (loading) return;

    // 🚫 No session → landing
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    // 🔥 Use stable identifier
    const userKey = user?.userId || user?.username;

    // 🚫 Prevent duplicate calls
    if (lastUserRef.current === userKey) return;
    lastUserRef.current = userKey;

    async function resolveUser() {
      try {
        console.log("🔍 AuthGate: checking user");
        const API_BASE = import.meta.env.VITE_API_URL;
        const data = await apiFetch(`${API_BASE}/users/me`);

        console.log("✅ AuthGate response:", data);

        // 🔥 STORE BACKEND USER (CRITICAL FIX)
        if (data?.user) {
          setAppUser(data.user);
        }

        // 🔥 ROUTING LOGIC
        if (!data?.hasProfile) {
          navigate("/home", {
            replace: true,
            state: { view: "onboarding" }
          });
        } else {
          navigate("/home", { replace: true });
        }

      } catch (err) {
        console.error("❌ AuthGate error:", err);

        // 🔁 allow retry
        lastUserRef.current = null;

        navigate("/", { replace: true });
      }
    }

    resolveUser();

  }, [user, loading, navigate, setAppUser]);

  return <div>Loading...</div>;
}