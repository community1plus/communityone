import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, appUser, setAppUser } = useAuth();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!user) {
          navigate("/");
          return;
        }

        // 🔥 1. CHECK IF USER EXISTS IN YOUR DB
        let res = await apiFetch("/users/me");

        // 🔥 2. IF NOT → CREATE USER
        if (!res || !res.id) {
          res = await apiFetch("/users/create", {
            method: "POST",
            body: JSON.stringify({
              email: user.email,
              sub: user.sub
            }),
          });
        }

        setAppUser(res);

        // 🔥 3. ROUTING LOGIC
        if (!res.profileCompleted) {
          navigate("/onboarding");
        } else {
          navigate("/home");
        }

      } catch (err) {
        console.error("AuthGate error:", err);
        navigate("/");
      }
    };

    bootstrap();
  }, [user]);

  return <div style={{ padding: 20 }}>Setting up your profile...</div>;
}