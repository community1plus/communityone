import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthGate() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const res = await apifetch("/users/me");
      const data = await res.json();

      if (!data.hasProfile) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }

    checkUser();
  }, []);

  return <div>Loading...</div>;
}