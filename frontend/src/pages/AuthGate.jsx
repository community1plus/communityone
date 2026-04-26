import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGate() {
  const navigate = useNavigate();
  const { appUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    /* =========================
       NOT AUTHENTICATED
    ========================= */

    if (!appUser) {
      navigate("/", { replace: true });
      return;
    }

    /* =========================
       AUTHENTICATED
    ========================= */

    if (appUser.hasProfile) {
      navigate("/home", { replace: true });
    } else {
      navigate("/profile-setup", { replace: true });
    }

  }, [appUser, loading, navigate]);

  return (
    <div style={{ padding: 40 }}>
      Setting up your account...
    </div>
  );
}