import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGate({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("🚫 Not authenticated → redirect");
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  // ⛔ CRITICAL: block render until auth resolved
  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}