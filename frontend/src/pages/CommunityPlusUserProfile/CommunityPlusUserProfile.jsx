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

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSave = async () => {
    try {
      await apiFetch("/users/profile/save-draft", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          homeLocation,
        }),
      });
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleClose = () => {
    if (
      window.confirm(
        "Are you sure you want to leave? Changes may not be saved."
      )
    ) {
      navigate("/home");
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

  useEffect(() => {
    if (homeLocation?.label) {
      setManualAddress(homeLocation.label);
    }
  }, [homeLocation]);

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

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">

      <div className="profile-page-header">
        <h2 className="profile-page-title">Create Profile</h2>

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

        <div className="profile-left">
          <form onSubmit={handleSubmit}>

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
                    <option value="COMMUNITY_SERVICE">Community Service</option>
                    <option value="GOVERNMENT">Government</option>
                  </select>
                </div>
              </>
            )}

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

              <div className="nav-left">
                <button
                  type="button"
                  className="nav-text-btn"
                  onClick={handleSave}
                >
                  Save
                </button>

                <button
                  type="button"
                  className="nav-text-btn danger"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>

              <div className="nav-actions">

                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="nav-icon-btn ghost"
                  >
                    ‹
                  </button>
                )}

                {currentStep !== 0 &&
                  currentStep < steps.length - 1 && (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="nav-icon-btn skip"
                    >
                      ↺
                    </button>
                  )}

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="nav-icon-btn primary"
                  >
                    ›
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="nav-icon-btn primary"
                  >
                    ✓
                  </button>
                )}
              </div>
            </div>

            {error && <p className="error">{error}</p>}
          </form>
        </div>

        <div className="profile-guide">
          <h3>Profile Guide</h3>
          <p>Follow the steps to complete your profile.</p>
        </div>

      </div>
    </div>
  );
}