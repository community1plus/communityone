import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

export default function useProfileSync() {
  const { user, setAppUser } = useAuth();

  useEffect(() => {
    if (!user?.token) return;

    let interval;

    const fetchProfile = async () => {
      try {
        const data = await apiFetch(
          "https://communityone-backend.onrender.com/api/users/me",
          {
            token: user.token,
          }
        );

        setAppUser({
          user: data.user,
          hasProfile: data.hasProfile,
          profile: data.profile,
        });

      } catch (err) {
        console.error("Profile sync failed", err);
      }
    };

    fetchProfile();

    interval = setInterval(fetchProfile, 10000);

    return () => clearInterval(interval);
  }, [user?.token]);
}