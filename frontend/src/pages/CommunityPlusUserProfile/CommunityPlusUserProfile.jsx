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
  } = useLocationContext();

  /* ==============================
   AUTO DATA HELPERS
  ============================== */

  const emailPrefix = appUser?.email?.split("@")[0] || "";

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";

  /* ==============================
   STATE
  ============================== */

  const [formData, setFormData] = useState({
    username: emailPrefix,
    display_name: getInitials(appUser?.name || emailPrefix),
    userType: "PERSONAL",

    phone: "",
    countryCode: "+61",

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

  /* ==============================
   STEP LOGIC
  ============================== */

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

    if (currentStep === 2 && !formData.phone) {
      setError("Enter your phone number.");
      return;
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

  /* ==============================
   ACTIONS
  ============================== */

  const handleClose = () => {
    if (window.confirm("Leave without saving?")) {
      navigate("/home");
    }
  };

  const verifySocial = (platform) => {
    alert(`${platform} verification coming soon`);
  };

  /* ==============================
   GOOGLE MAPS
  ============================== */

  const googleMapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded: mapsLoaded, loadError: mapsLoadError } =
    useJsApiLoader({
      id: "community-one-google-maps",
      googleMapsApiKey,
      libraries: GOOGLE_LIBRARIES,
    });

  /* ==============================
   EFFECTS
  ============================== */

  useEffect(() => {
    if (homeLocation?.label) {
      setManualAddress(homeLocation.label);
    }
  }, [homeLocation]);

  /* ==============================
   HANDLERS
  ============================== */

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


  const handleSave = async () => {
  try {
    const payload = {
      username: formData.username,
      display_name: formData.display_name,
      user_type: formData.user_type,
      phone: formData.phone,
      social: formData.social,
      payment: formData.payment,
    };

    const res = await apiFetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔥 important if using auth cookies
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Save failed");

    console.log("✅ Profile saved:", data);
    alert("Profile saved successfully");

  } catch (err) {
    console.error("❌ Save error:", err);
    alert("Failed to save profile");
  }
};

  const onPlaceChanged = () => {
    const place = autoRef.current?.getPlace?.();
    if (!place || !place.geometry) return;

    const loc = {
      label: place.formatted_address || place.name,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setManualAddress(loc.label);
    setHome(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await apiFetch("/users/profile/create", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          homeLocation,
        }),
      });

      navigate("/home", { replace: true });
    } catch {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };
  console.log("appUser:", appUser);
  useEffect(() => {
  if (!appUser?.user) return;

  const email = appUser.user.email || "";
  const emailPrefix = email.split("@")[0];

  const getInitials = (str) =>
    str
      ? str
          .split(/[.\s-_]/) // handles ade.oloyede, ade-oloyede etc
          .map((s) => s[0])
          .join("")
          .toUpperCase()
      : "";

  setFormData((prev) => ({
    ...prev,
    username: prev.username || emailPrefix,
    display_name:
      prev.display_name || getInitials(emailPrefix),
  }));
}, [appUser]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">

      <div className="profile-page-header">
        <h2 className="profile-page-title">Create Profile</h2>

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

      <div className="profile-layout">

        <div className="profile-left">
          <form onSubmit={handleSubmit}>

            {/* STEP 1 */}
            {currentStep === 0 && (
              <>
                <div className="form-group">
                  <label>Username</label>
                  <input value={formData.username} readOnly />
                </div>

                <div className="form-group">
                  <label>Display Name</label>
                  <input value={formData.display_name} readOnly />
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
                    <option value="COMMUNITY_SERVICE">Community</option>
                    <option value="GOVERNMENT">Government</option>
                  </select>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 1 && (
              <div className="location-section">
                <label>Home Location</label>
                <Autocomplete
                  onLoad={(auto) => (autoRef.current = auto)}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    value={manualAddress}
                    onChange={handleManualAddressChange}
                  />
                </Autocomplete>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 2 && (
              <div className="form-group">
                <label>Phone</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input value={formData.countryCode} />
                  <input
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 3 &&
              ["youtube", "twitter", "instagram"].map((p) => (
                <div key={p} className="form-group">
                  <input
                    placeholder={`${p}`}
                    value={formData.social[p]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, [p]: e.target.value },
                      })
                    }
                  />
                  <button type="button" onClick={() => verifySocial(p)}>
                    Verify
                  </button>
                </div>
              ))}

            {/* STEP 5 */}
            {currentStep === 4 && (
              <>
                <input
                  placeholder="Card Number"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      card: { ...formData.card, number: e.target.value },
                    })
                  }
                />
              </>
            )}

            {/* NAV (UNCHANGED) */}
            <div className="form-navigation">
              <div className="nav-left">
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={handleClose}>Close</button>
              </div>

              <div className="nav-actions">
                {currentStep > 0 && (
                  <button onClick={prevStep}>‹</button>
                )}
                <button onClick={nextStep}>›</button>
              </div>
            </div>

            {error && <p className="error">{error}</p>}

          </form>
        </div>

        <div className="profile-guide">
          <h3>Profile Guide</h3>
        </div>

      </div>
    </div>
  );
}