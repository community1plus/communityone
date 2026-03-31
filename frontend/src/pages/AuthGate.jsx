import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
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
  }, [navigate]);

  return <div>Loading...</div>;
}