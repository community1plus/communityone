import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";

import "../../styles/system.css"; // 🔥 NEW SYSTEM

const GOOGLE_LIBRARIES = ["places"];

export default function CommunityPlusUserProfile({ mode = "edit" }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { appUser, setAppUser } = useAuth();
  const { homeLocation, setHome } = useLocationContext();

  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    userType: "PERSONAL",
    phone: "",
    social: { youtube: "", twitter: "", instagram: "" },
    card: { number: "", expiry: "", cvc: "", name: "" },
  });

  const [manualAddress, setManualAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Identity",
    "Home",
    "Contact",
    "Social",
    "Payment",
  ];

  /* ==============================
     PREFILL
  ============================== */

  useEffect(() => {
    if (!appUser?.user) return;

    const email = appUser.user.email || "";
    const prefix = email.split("@")[0];

    setFormData((prev) => ({
      ...prev,
      username: prefix,
      display_name: prefix.slice(0, 2).toUpperCase(),
    }));
  }, [appUser]);

  useEffect(() => {
    if (!appUser?.profile) return;

    const p = appUser.profile;

    setFormData((prev) => ({
      ...prev,
      username: p.username || prev.username,
      display_name: p.display_name || prev.display_name,
      userType: p.user_type || prev.userType,
      phone: p.phone || "",
      social: p.social || prev.social,
      card: p.payment || prev.card,
    }));

    if (p.homeLocation) {
      setManualAddress(p.homeLocation.label || "");
      setHome(p.homeLocation);
    }
  }, [appUser]);

  /* ==============================
     GOOGLE
  ============================== */

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  const onPlaceChanged = () => {
    const place = autoRef.current?.getPlace();
    if (!place?.geometry) return;

    const loc = {
      label: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setManualAddress(loc.label);
    setHome(loc);
  };

  /* ==============================
     ACTIONS
  ============================== */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        user_id: appUser?.user?.id,
        username: formData.username,
        display_name: formData.display_name,
        user_type: formData.userType,
        phone: formData.phone,
        social: formData.social,
        payment: formData.card,
        homeLocation,
      };

      const res = await fetch(
        "https://communityone-backend.onrender.com/api/profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setAppUser((prev) => ({
        ...prev,
        hasProfile: true,
        profile: data,
      }));

      navigate("/home", { replace: true });

    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  /* ==============================
     RENDER
  ============================== */

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="page-header">
        <h1 className="section-title">
          {mode === "edit" ? "Edit Profile" : "Create Profile"}
        </h1>

        <div className="profile-page-steps">
          {steps.map((step, i) => (
            <span
              key={step}
              className={`step ${i === currentStep ? "active" : ""}`}
              onClick={() => setCurrentStep(i)}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* LAYOUT */}
      <div className="page-layout">

        {/* LEFT */}
        <div className="card card-primary">

          {/* STEP CONTENT */}
          <div className="section">

            {currentStep === 0 && (
              <>
                <input className="input" value={formData.username} readOnly />
                <input className="input" value={formData.display_name} readOnly />

                <select
                  className="input"
                  value={formData.userType}
                  onChange={(e) =>
                    setFormData({ ...formData, userType: e.target.value })
                  }
                >
                  <option value="PERSONAL">Personal</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </>
            )}

            {currentStep === 1 && isLoaded && (
              <Autocomplete
                onLoad={(auto) => (autoRef.current = auto)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  className="input"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </Autocomplete>
            )}

            {currentStep === 2 && (
              <input
                className="input"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            )}

          </div>

          {/* NAV */}
          <div className="form-navigation">

            <div className="nav-left">
              <button className="btn-ghost" onClick={() => navigate("/home")}>
                Close
              </button>
            </div>

            <div className="nav-actions">
              {currentStep > 0 && (
                <button className="nav-icon-btn ghost" onClick={prevStep}>
                  ‹
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button className="nav-icon-btn primary" onClick={nextStep}>
                  ›
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  Save
                </button>
              )}
            </div>

          </div>

          {error && <div className="error">{error}</div>}

        </div>

        {/* RIGHT */}
        <div className="card card-soft">
          <div className="section">
            <div className="section-title">Profile Guide</div>
            <div className="section-meta">
              Complete your profile to unlock platform features.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}