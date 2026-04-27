import { useAuth } from "../context/AuthContext";
import LandingPage from "./CommunityPlusLandingPage";
import Dashboard from "./Dashboard";

export default function AuthGate() {
  const { user, loading, initialized } = useAuth();

  // 🚧 HARD BLOCK → prevents flicker
  if (!initialized || loading) {
    return null; // or spinner
  }

  return user ? <Dashboard /> : <LandingPage />;
}