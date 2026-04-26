import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, appUser, loading, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return; // 🔥 WAIT

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (user && !appUser?.hasProfile) {
      navigate("/onboarding", { replace: true });
      return;
    }

    if (user && appUser?.hasProfile) {
      navigate("/app", { replace: true });
    }

  }, [user, appUser, initialized, navigate]);

  return <div style={{ padding: 20 }}>Loading...</div>;
}