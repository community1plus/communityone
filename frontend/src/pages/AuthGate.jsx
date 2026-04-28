import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGate({ children }) {
  const { loading, isAuthenticated } = useAuth();

  // ⛔ block until resolved
  if (loading) {
    return <div>Loading...</div>;
  }

  // 🔥 declarative redirect (NO useEffect)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}