import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGate() {
  const navigate = useNavigate();
  const { appUser, loading } = useAuth();

  console.log("🔥 RENDER:", { appUser, loading });

  useEffect(() => {
    console.log("⚡ EFFECT RUN:", { appUser, loading });

    if (loading) {
      console.log("⏳ Still loading...");
      return;
    }

    if (!appUser) {
      console.log("❌ No appUser");
      return;
    }

    console.log("✅ User loaded:", appUser);

    if (appUser.hasProfile) {
      console.log("➡️ NAVIGATE HOME");
      navigate("/home", { replace: true });
    } else {
      console.log("➡️ NAVIGATE PROFILE SETUP");
      navigate("/profile-setup", { replace: true });
    }

  }, [appUser, loading, navigate]);

  return (
    <div style={{ padding: 40 }}>
      Setting up your account...
    </div>
  );
}