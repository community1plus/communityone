import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* =====================================================
   AUTH GATE (🔥 STABLE + DEBUG ENABLED)
===================================================== */

export default function AuthGate() {
  const navigate = useNavigate();

  const {
    user,
    appUser,
    loading,
    initialized,
  } = useAuth();

  /* =========================
     🔍 DEBUG LOGGING
  ========================= */

  console.log("🔐 AUTH GATE STATE:", {
    user,
    appUser,
    loading,
    initialized,
  });

  /* =========================
     🚫 HARD BLOCK (CRITICAL)
  ========================= */

  if (!initialized) {
    console.log("⏳ Auth not initialized yet");
    return <div style={{ padding: 20 }}>Initialising...</div>;
  }

  /* =========================
     ROUTING LOGIC
  ========================= */

  useEffect(() => {
    console.log("🚦 AuthGate routing decision start");

    if (!user) {
      console.log("➡️ No user → redirect to landing");
      navigate("/", { replace: true });
      return;
    }

    // 🔥 IMPORTANT: distinguish undefined vs null
    if (appUser === undefined) {
      console.log("⏳ appUser still loading → wait");
      return;
    }

    if (appUser === null || !appUser?.hasProfile) {
      console.log("➡️ No profile → onboarding");
      navigate("/onboarding", { replace: true });
      return;
    }

    console.log("➡️ User ready → dashboard");
    navigate("/app", { replace: true });

  }, [user, appUser, navigate]);

  /* =========================
     FALLBACK UI
  ========================= */

  return (
    <div style={{ padding: 20 }}>
      Routing...
    </div>
  );
}