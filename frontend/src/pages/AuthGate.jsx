import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, setAppUser, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const bootstrap = async () => {
      try {
        if (!user) {
          navigate("/", { replace: true });
          return;
        }

        const res = await apiFetch("/users/me");
        console.log("AuthGate /users/me:", res);

        if (!res?.user?.id) {
          throw new Error("User record not returned from /users/me");
        }

        setAppUser(res);

        const onboardingCompleted =
          res?.user?.mfa_enabled === true &&
          !!res?.profile?.home_address;

        if (!onboardingCompleted) {
          navigate("/profile-setup", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error("AuthGate error:", err);
        navigate("/", { replace: true });
      }
    };

    bootstrap();
  }, [user, authLoading, navigate, setAppUser]);

  return <div style={{ padding: 20 }}>Setting up your account...</div>;
}