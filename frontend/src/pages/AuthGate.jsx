import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, loading, setAppUser } = useAuth();

  const lastUserRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    const userKey = user?.userId || user?.username;

    if (lastUserRef.current === userKey) return;
    lastUserRef.current = userKey;

    async function resolveUser() {
      try {
        console.log("🔍 AuthGate: checking user");

        const API_BASE = import.meta.env.VITE_API_BASE;
        console.log("API_BASE:", import.meta.env.VITE_API_BASE);
        /* ===============================
           🔐 GET AUTH TOKEN
        =============================== */

        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString(); // 🔥 FORCE ACCESS TOKEN
        if (!token) {
          throw new Error("No auth token available");
        }

        /* ===============================
           🌐 CALL BACKEND
        =============================== */

        const res = await fetch(`${API_BASE}/users/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // 🔥 CRITICAL
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json(); // 🔥 CRITICAL FIX

        console.log("✅ AuthGate response:", data);

        /* ===============================
           🧠 STORE USER
        =============================== */

        if (!data || !data.user) {
          throw new Error("Invalid user response");
        }

        setAppUser(data.user);

        /* ===============================
           🚦 ROUTING
        =============================== */

        if (!data.hasProfile) {
          navigate("/home", {
            replace: true,
            state: { view: "onboarding" },
          });
        } else {
          navigate("/home", { replace: true });
        }

      } catch (err) {
        console.error("❌ AuthGate error:", err);

        lastUserRef.current = null;

        navigate("/", { replace: true });
      }
    }

    resolveUser();

  }, [user, loading, navigate, setAppUser]);

  return <div>Loading...</div>;
}