import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { apiFetch } from "../../../services/api";
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

  // ✅ STEP FLOW
  const steps = [
    "Identity",
    "Home Address",
    "Contact",
    "Social",
    "Payment Details",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
  if (currentStep === 0) {
    if (
      !formData.username ||
      !formData.display_name ||
      !formData.userType
    ) {
      setError("Complete all identity fields.");
      return;
    }
  }

  setError("");

  if (currentStep < steps.length - 1) {
    setCurrentStep((s) => s + 1);
  }
};

  const googleMapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded: mapsLoaded, loadError: mapsLoadError } =
    useJsApiLoader({
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
          const emailPrefix =
            appUser?.email?.split("@")[0] || "";

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

    const homeAddress =
      homeLocation?.label || manualAddress.trim();

    setSaving(true);
    setError("");

    try {
      await apiFetch("/users/profile/create", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          homeAddress,
          homeLocation,
        }),
      });

      navigate("/home", { replace: true });
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
          Create Profile
        </h2>

        <div className="profile-page-steps">
          {steps.map((step, index) => (
            <span
              key={step}
              className={`step ${
                index === currentStep ? "active" : ""
              }`}
              onClick={() => setCurrentStep(index)}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      <div className="profile-layout">

        {/* LEFT PANEL */}
        <div className="profile-left">
          <form onSubmit={handleSubmit}>

            {/* STEP 1 */}
            {currentStep === 0 && (
              <>
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
                    <option value="COMMUNITY_SERVICE">
                      Community Service
                    </option>
                    <option value="GOVERNMENT">Government</option>
                  </select>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 1 && (
              <div className="location-section">
                <label>Home Location</label>

                {mapsLoaded && !mapsLoadError ? (
                  <Autocomplete
                    onLoad={(auto) => (autoRef.current = auto)}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      placeholder="Search your suburb..."
                      value={manualAddress}
                      onChange={handleManualAddressChange}
                    />
                  </Autocomplete>
                ) : (
                  <input
                    placeholder="Enter your suburb..."
                    value={manualAddress}
                    onChange={handleManualAddressChange}
                  />
                )}
              </div>
            )}

            {/* NAV */}
            <div className="form-navigation">

  {/* BACK */}
  {currentStep > 0 && (
    <button
      type="button"
      onClick={prevStep}
      className="nav-icon-btn ghost"
      title="Back"
    >
      ←
    </button>
  )}

  <div className="nav-actions">

    {/* SKIP (only for non-required steps) */}
    {currentStep !== 0 && currentStep < steps.length - 1 && (
      <button
        type="button"
        onClick={nextStep}
        className="nav-icon-btn skip"
        title="Skip"
      >
        ↷
      </button>
    )}

    {/* NEXT / SUBMIT */}
    {currentStep < steps.length - 1 ? (
      <button
        type="button"
        onClick={nextStep}
        className="nav-icon-btn primary"
        title="Next"
      >
        →
      </button>
    ) : (
      <button
        type="submit"
        disabled={saving}
        className="nav-icon-btn primary"
        title="Submit"
      >
        ✓
      </button>
    )}

  </div>

</div>

            {error && <p className="error">{error}</p>}
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="profile-guide">
          <h3>Profile Guide</h3>
          <p>Follow the steps to complete your profile.</p>
        </div>

      </div>
    </div>
  );
}