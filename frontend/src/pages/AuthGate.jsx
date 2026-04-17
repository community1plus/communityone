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

        let res = await apiFetch("/users/me");

        if (!res || !res.id) {
          res = await apiFetch("/users/create", {
            method: "POST",
            body: JSON.stringify({
              email: user.email,
              sub: user.sub,
              mfaEnabled: false,
              homeAddress: null,
              profileLevel: 0,
              profileCompletionPercent: 0,
            }),
          });
        }

        setAppUser(res);

        const onboardingCompleted =
          res?.mfaEnabled === true && !!res?.homeAddress;

        if (!onboardingCompleted) {
          navigate("/onboarding", { replace: true });
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