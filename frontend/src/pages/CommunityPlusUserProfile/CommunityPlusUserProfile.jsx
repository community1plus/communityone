import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ THIS
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { apiFetch } from "../../../services/api";
import { useLocationContext } from "../../context/LocationContext";
import { useAuth } from "../../context/AuthContext";

import "./CommunityPlusUserProfile.css";

export default function CommunityPlusUserProfile({ mode = "edit" }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { appUser } = useAuth();

  const {
    homeLocation,
    liveLocation,
    viewLocation,
    setHome,
    enableLiveLocation,
  } = useLocationContext();

  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    userType: "PERSONAL",
  });

  const [manualAddress, setManualAddress] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const {
    isLoaded: mapsLoaded,
    loadError: mapsLoadError,
  } = useJsApiLoader({
    id: "community-one-google-maps",
    googleMapsApiKey,
    libraries: GOOGLE_LIBRARIES,
  });

  // ==============================
  // EFFECTS
  // ==============================

  useEffect(() => {
    if (homeLocation?.label) {
      setManualAddress(homeLocation.label);
    }
  }, [homeLocation]);

  useEffect(() => {
    if (mode !== "edit") {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        const data = await apiFetch("/users/me");

        if (data.profile) {
          setFormData({
            username: data.profile.username || "",
            display_name: data.profile.display_name || "",
            userType: data.profile.userType || "PERSONAL",
          });

          if (data.profile.homeLocation?.label) {
            setManualAddress(data.profile.homeLocation.label);
          }
        } else {
          const emailPrefix = appUser?.email?.split("@")[0] || "";

          setFormData({
            username: appUser?.username || emailPrefix,
            display_name: appUser?.name || emailPrefix,
            userType: "PERSONAL",
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

  // ==============================
  // HANDLERS
  // ==============================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleManualAddressChange = (e) => {
    const value = e.target.value;
    setManualAddress(value);

    setHome({
      label: value,
      lat: null,
      lng: null,
      type: "home",
    });
  };

  const onPlaceChanged = () => {
    const place = autoRef.current?.getPlace?.();
    if (!place || !place.geometry) return;

    const loc = {
      label: place.formatted_address || place.name,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      type: "home",
    };

    setManualAddress(loc.label);
    setHome(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const homeAddress = homeLocation?.label || manualAddress.trim();

    if (!formData.username || !formData.display_name) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!homeAddress) {
      setError("Please set your home address.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const endpoint =
        mode === "onboarding"
          ? "/users/profile/create"
          : "/users/update";

      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          homeAddress,
          homeLocation,
        }),
      });

      if (mode === "onboarding") {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // RENDER
  // ==============================

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">

      {/* HEADER */}
      <div className="profile-page-header">
        <h2 className="profile-page-title">
          {mode === "onboarding" ? "Create Profile" : "Profile Settings"}
        </h2>

        {mode === "onboarding" && (
          <div className="profile-page-steps">
            <span className="step active">Identity</span>
            <span className="step">Home Address</span>
            <span className="step">Contact</span>
            <span className="step">Social</span>
            <span className="step">Payment Details</span>
          </div>
        )}
      </div>

      {/* GRID */}
      <div className="profile-layout">

        {/* LEFT */}
        <div className="profile-left">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Username</label>
              <input name="username" value={formData.username} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input name="display_name" value={formData.display_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>User Type</label>
              <select name="userType" value={formData.userType} onChange={handleChange}>
                <option value="PERSONAL">Personal</option>
                <option value="BUSINESS">Business</option>
                <option value="MIXED">Mixed</option>
                <option value="COMMUNITY_SERVICE">Community Service</option>
                <option value="GOVERNMENT">Government</option>
              </select>
            </div>

            <div className="location-section">
              <label>Home Location</label>

              <Autocomplete onLoad={(auto) => (autoRef.current = auto)} onPlaceChanged={onPlaceChanged}>
                <input
                  placeholder="Search your suburb..."
                  className="location-input"
                  value={manualAddress}
                  onChange={handleManualAddressChange}
                />
              </Autocomplete>

              <div className="location-row">
                <span>📍 Home</span>
                <strong>{homeLocation?.label || "Not set"}</strong>
              </div>

              <div className="location-row">
                <span>📡 Current</span>
                <strong>{liveLocation?.label || "Not active"}</strong>
                <button type="button" onClick={enableLiveLocation} className="ghost-btn">
                  Use GPS
                </button>
              </div>

              <div className="location-row">
                <span>🧭 Nearby</span>
                <strong>{viewLocation?.label || "—"}</strong>
              </div>
            </div>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Profile"}
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        </div>

        {/* RIGHT */}
        <div className="profile-guide">
          <h3>Profile Guide</h3>

          <div className="guide-section">
            <strong>Username</strong>
            <p>Choose something simple and memorable.</p>
          </div>

          <div className="guide-section">
            <strong>Display Name</strong>
            <p>This is how others see you.</p>
          </div>

          <div className="guide-section">
            <strong>Home Location</strong>
            <p>Used to personalise your feed.</p>
          </div>
        </div>

      </div>
    </div>
  );
}