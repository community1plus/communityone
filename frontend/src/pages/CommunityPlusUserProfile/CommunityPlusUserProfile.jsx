import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useLocationContext } from "../../context/LocationContext";
import { useAuth } from "../../context/AuthContext";

import "./CommunityPlusUserProfile.css";

const GOOGLE_LIBRARIES = ["places"];

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
          } else if (data.profile.homeAddress) {
            setManualAddress(data.profile.homeAddress);
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

    const components = place.address_components || [];

    const suburb =
      components.find((c) => c.types.includes("locality")) ||
      components.find((c) => c.types.includes("sublocality_level_1"));

    const state = components.find((c) =>
      c.types.includes("administrative_area_level_1")
    );

    const postcode = components.find((c) =>
      c.types.includes("postal_code")
    );

    const label =
      `${suburb?.long_name || ""}${suburb ? ", " : ""}${state?.short_name || ""} ${postcode?.long_name || ""}`.trim() ||
      place.formatted_address ||
      place.name ||
      "";

    const loc = {
      label,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      type: "home",
    };

    setManualAddress(label);
    setHome(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const homeAddress = homeLocation?.label || manualAddress.trim();

    if (!formData.username || !formData.display_name) {
      setError("Please fill in all required profile fields.");
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
          homeLocation: homeLocation || {
            label: homeAddress,
            lat: null,
            lng: null,
            type: "home",
          },
        }),
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

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-page-header">
        
          <h2 className="profile-page-title">
          {mode === "onboarding" ? "Create Profile" : "Profile Settings"}
        </h2>
        

        
      </div>

      <div className="profile-layout">
        <div className="profile-left">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
              />
            </div>

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

            <div className="location-section">
              <label>Home Location</label>

              {googleMapsApiKey && mapsLoaded && !mapsLoadError ? (
                <Autocomplete
                  onLoad={(auto) => {
                    autoRef.current = auto;
                  }}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    placeholder="Search your suburb..."
                    className="location-input"
                    value={manualAddress}
                    onChange={handleManualAddressChange}
                  />
                </Autocomplete>
              ) : (
                <input
                  placeholder="Enter your suburb or address..."
                  className="location-input"
                  value={manualAddress}
                  onChange={handleManualAddressChange}
                />
              )}

              {mapsLoadError && (
                <p className="error">
                  Google Maps could not be loaded. You can still enter your home
                  address manually.
                </p>
              )}

              {!googleMapsApiKey && (
                <p className="error">
                  Google Maps API key not found. Using manual address entry.
                </p>
              )}

              <div className="location-row">
                <span>📍 Home:</span>
                <strong>{homeLocation?.label || manualAddress || "Not set"}</strong>
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