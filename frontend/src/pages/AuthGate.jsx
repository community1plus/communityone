import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGate() {
  const navigate = useNavigate();
  const { appUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!appUser) return;

    console.log("🔍 AuthGate appUser:", appUser);

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