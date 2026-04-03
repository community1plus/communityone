import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { Autocomplete } from "@react-google-maps/api";
import { useLocationContext } from "../../context/LocationContext";
import { useAuth } from "../../context/AuthContext"; // 🔥 FIX

import "./CommunityPlusUserProfile.css";

export default function CommunityPlusUserProfile({ mode = "edit" }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { appUser } = useAuth(); // 🔥 FIX

  const {
    homeLocation,
    liveLocation,
    viewLocation,
    setHome,
    enableLiveLocation
  } = useLocationContext();

  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    userType: "PERSONAL"
  });

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     LOAD PROFILE
  =============================== */

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
        } else {
          // 🔥 FALLBACK TO AUTH DATA
          setFormData({
            username: appUser?.username || "",
            display_name:
              appUser?.attributes?.name ||
              appUser?.attributes?.email?.split("@")[0] ||
              "",
            userType: "PERSONAL"
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [mode, appUser]);

  /* ===============================
     FORM HANDLING
  =============================== */

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

  /* ===============================
     LOCATION PICKER
  =============================== */

  const onPlaceChanged = () => {
    const place = autoRef.current.getPlace();
    if (!place.geometry) return;

    const components = place.address_components;

    const suburb =
      components.find(c => c.types.includes("locality")) ||
      components.find(c => c.types.includes("sublocality_level_1"));

    const state = components.find(c =>
      c.types.includes("administrative_area_level_1")
    );

    const postcode = components.find(c =>
      c.types.includes("postal_code")
    );

    const loc = {
      label: `${suburb?.long_name}, ${state?.short_name} ${postcode?.long_name || ""}`,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      type: "home"
    };

    setHome(loc);
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">

      <h2>
        {mode === "onboarding"
          ? "Create your profile"
          : "Profile Settings"}
      </h2>

      <div className="profile-layout">

        {/* ===============================
           LEFT PANEL (FORM)
        =============================== */}
        <div className="profile-left">

          <form onSubmit={handleSubmit}>

            {/* USERNAME */}
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            {/* DISPLAY NAME */}
            <div className="form-group">
              <label>Display Name</label>
              <input
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
              />
            </div>

            {/* USER TYPE */}
            <div className="form-group">
              <label>User Type</label>
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
            </div>

            {/* LOCATION */}
            <div className="location-section">

              <label>Home Location</label>

              <Autocomplete
                onLoad={(auto) => (autoRef.current = auto)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  placeholder="Search your suburb..."
                  className="location-input"
                />
              </Autocomplete>

              <div className="location-row">
                <span>📍 Home:</span>
                <strong>{homeLocation?.label || "Not set"}</strong>
              </div>

              <div className="location-row">
                <span>📡 Current:</span>
                <strong>{liveLocation?.label || "Not active"}</strong>
                <button
                  type="button"
                  onClick={enableLiveLocation}
                  className="ghost-btn"
                >
                  Use GPS
                </button>
              </div>

              <div className="location-row">
                <span>🧭 Nearby:</span>
                <strong>{viewLocation?.label || "—"}</strong>
              </div>

            </div>

            {/* SUBMIT */}
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

        {/* ===============================
           RIGHT PANEL (GUIDE)
        =============================== */}
        <div className="profile-right">

          <div className="profile-guide">

            <h3>Profile Guide</h3>

            <div className="guide-section">
              <strong>Username</strong>
              <p>Your unique identity. Choose something simple and memorable.</p>
            </div>

            <div className="guide-section">
              <strong>Display Name</strong>
              <p>This is how others will see you across the platform.</p>
            </div>

            <div className="guide-section">
              <strong>User Type</strong>
              <p>Select how you participate in the community.</p>
            </div>

            <div className="guide-section">
              <strong>Home Location</strong>
              <p>Your feed and alerts are powered by this location.</p>
            </div>

            <div className="guide-section">
              <strong>Live Location (GPS)</strong>
              <p>Enable GPS for real-time updates and local awareness.</p>
            </div>

            <div className="guide-section">
              <strong>🚨 Emergency Beacon (Upcoming)</strong>
              <p>
                Verified users will be able to send SOS alerts. Activation
                will require verification to prevent misuse.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}