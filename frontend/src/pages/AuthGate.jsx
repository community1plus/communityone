import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function AuthGate() {
  const navigate = useNavigate();
  const { user, setAppUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const bootstrap = async () => {
      console.time("authgate-total");

      try {
        if (!user?.authenticated) {
          navigate("/", { replace: true });
          return;
        }

        console.time("users-me");
        const res = await apiFetch("/users/me");
        console.timeEnd("users-me");

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
      } finally {
        console.timeEnd("authgate-total");
      }
    };

    bootstrap();
  }, [user, loading, navigate, setAppUser]);

  return <div style={{ padding: 20 }}>Setting up your account...</div>;
}