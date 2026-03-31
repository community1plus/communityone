import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";

export default function CommunityPlusUserProfile({ mode = "edit" }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    userType: "PERSONAL"
  });

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔥 Load profile ONLY in edit mode
  useEffect(() => {
    if (mode !== "edit") return;

    async function loadProfile() {
      try {
        const data = await apiFetch("/api/users/me");

        if (data.profile) {
          setFormData({
            username: data.profile.username || "",
            display_name: data.profile.display_name || "",
            userType: data.profile.userType || "PERSONAL"
          });
        }

      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [mode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.display_name) {
      setError("Please fill in all fields");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const endpoint =
        mode === "onboarding"
          ? "/api/users/profile/create"
          : "/api/users/update";

      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(formData)
      });

      // 🔥 Navigation logic
      if (mode === "onboarding") {
        navigate("/home", { replace: true });
      }

    } catch (err) {
      console.error("Profile save failed", err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">

      <h2>
        {mode === "onboarding"
          ? "Create your profile"
          : "Profile Settings"}
      </h2>

      <form onSubmit={handleSubmit}>

        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <input
          name="display_name"
          placeholder="Display Name"
          value={formData.display_name}
          onChange={handleChange}
        />

        <select
          name="userType"
          value={formData.userType}
          onChange={handleChange}
        >
          <option value="PERSONAL">Personal</option>
          <option value="BUSINESS">Business</option>
          <option value="MIXED">Mixed</option>
          <option value="COMMUNITY_SERVICE">Community Service</option>
          <option value="GOVERNMENT">Government</option>
        </select>

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : mode === "onboarding"
            ? "Create Profile"
            : "Save Changes"}
        </button>

        {error && <p className="error">{error}</p>}

      </form>
    </div>
  );
}