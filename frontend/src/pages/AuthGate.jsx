import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { useAuth } from "../context/AuthContext";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function checkUser() {
      // 🔥 Extra safety: no session → exit
      if (!user) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const data = await apiFetch("/api/users/me");

        if (!data.hasProfile) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }

      } catch (err) {
        console.error("AuthGate error:", err);
        navigate("/", { replace: true });
      }
    }

    checkUser();
  }, [user, navigate]);

  return <div>Loading...</div>;
}