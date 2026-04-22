import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";

import "./CommunityPlusUserProfile.css";

const GOOGLE_LIBRARIES = ["places"];

export default function CommunityPlusUserProfile({ mode = "edit" }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { appUser, setAppUser } = useAuth();
  const { homeLocation, setHome } = useLocationContext();

  /* ==============================
     HELPERS
  ============================== */

  const getInitials = (str) =>
    str
      ? str
          .split(/[.\s-_]/)
          .map((s) => s[0])
          .join("")
          .toUpperCase()
      : "";

  /* ==============================
     STATE
  ============================== */

  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    userType: "PERSONAL",
    phone: "",

    social: {
      youtube: "",
      twitter: "",
      instagram: "",
    },

    card: {
      number: "",
      expiry: "",
      cvc: "",
      name: "",
    },
  });

  const [manualAddress, setManualAddress] = useState("");
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

  /* ==============================
     AUTO POPULATE (NEW USERS)
  ============================== */

  useEffect(() => {
    if (!appUser?.user) return;

    const email = appUser.user.email || "";
    const prefix = email.split("@")[0];

    setFormData((prev) => ({
      ...prev,
      username: prefix,
      display_name: getInitials(prefix),
    }));
  }, [appUser]);

  /* ==============================
     PREFILL EXISTING PROFILE (NEW)
  ============================== */

  useEffect(() => {
    if (!appUser?.profile) return;

    const p = appUser.profile;

    console.log("📦 Prefilling profile:", p);

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
     GOOGLE MAPS
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
     SAVE (UPGRADED)
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

      console.log("🚀 PAYLOAD:", payload);

      const res = await fetch(
        "https://communityone-backend.onrender.com/api/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Save failed");

      console.log("✅ Profile saved:", data);

      /* ==========================
         🔥 UPDATE GLOBAL STATE
      ========================== */

      setAppUser((prev) => ({
        ...prev,
        hasProfile: true,
        profile: data,
      }));

      /* ==========================
         🔥 REDIRECT
      ========================== */

      navigate("/home", { replace: true });

    } catch (err) {
      console.error("❌ Save error:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    navigate("/home");
  };

  const nextStep = () => {
    if (currentStep === 0 && !formData.userType) {
      setError("Select account type");
      return;
    }

    if (currentStep === 2 && !formData.phone) {
      setError("Enter phone number");
      return;
    }

    setError("");
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  /* ==============================
     UI
  ============================== */

  return (
    <div className="profile-container">

      <div className="profile-page-header">
        <h2>{mode === "edit" ? "Edit Profile" : "Create Profile"}</h2>

        <div className="profile-page-steps">
          {steps.map((step, i) => (
            <span
              key={step}
              className={i === currentStep ? "active" : ""}
              onClick={() => setCurrentStep(i)}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      <div className="profile-layout">

        <div className="profile-left">

          {currentStep === 0 && (
            <>
              <input value={formData.username} readOnly />
              <input value={formData.display_name} readOnly />

              <select
                name="userType"
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
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
              />
            </Autocomplete>
          )}

          {currentStep === 2 && (
            <input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          )}

          <div className="form-navigation">
            <button onClick={handleSave} disabled={saving}>
              Save
            </button>

            <button onClick={handleClose}>
              Close
            </button>

            <div>
              {currentStep > 0 && (
                <button onClick={prevStep}>‹</button>
              )}
              <button onClick={nextStep}>›</button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

        </div>

        <div className="profile-guide">
          <h3>Profile Guide</h3>
        </div>

      </div>
    </div>
  );
}