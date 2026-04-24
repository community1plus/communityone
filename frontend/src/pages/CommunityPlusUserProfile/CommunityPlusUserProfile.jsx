import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";

import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import Section from "../../components/UI/Section";
import Button from "../../components/UI/Button";

// 🔥 NEW FORM SYSTEM
import Input from "../../components/UI/Form/Input";
import Select from "../../components/UI/Form/Select";
import Field from "../../components/UI/Form/Field";

import "../../styles/system.css";

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

  const steps = ["Identity", "Home", "Contact", "Social", "Payment"];

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

      <PageHeader
        title={mode === "edit" ? "Edit Profile" : "Create Profile"}
        meta="Complete your profile to unlock platform features"
      />

      {/* STEP NAV */}
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

      <div className="page-layout">

        {/* LEFT */}
        <Card>

          <Section>

            {/* STEP 1 */}
            {currentStep === 0 && (
              <>
                <Field label="Username">
                  <Input value={formData.username} readOnly />
                </Field>

                <Field label="Display Name">
                  <Input value={formData.display_name} readOnly />
                </Field>

                <Field label="Account Type">
                  <Select
                    value={formData.userType}
                    onChange={(e) =>
                      setFormData({ ...formData, userType: e.target.value })
                    }
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="BUSINESS">Business</option>
                  </Select>
                </Field>
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 1 && isLoaded && (
              <Field label="Home Location">
                <Autocomplete
                  onLoad={(auto) => (autoRef.current = auto)}
                  onPlaceChanged={onPlaceChanged}
                >
                  <Input
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Enter address"
                  />
                </Autocomplete>
              </Field>
            )}

            {/* STEP 3 */}
            {currentStep === 2 && (
              <Field label="Phone">
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone"
                />
              </Field>
            )}

            {/* STEP 4 */}
            {currentStep === 3 && (
              <>
                <Field label="Instagram">
                  <Input
                    value={formData.social.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, instagram: e.target.value },
                      })
                    }
                  />
                </Field>

                <Field label="Twitter">
                  <Input
                    value={formData.social.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, twitter: e.target.value },
                      })
                    }
                  />
                </Field>
              </>
            )}

            {/* STEP 5 */}
            {currentStep === 4 && (
              <>
                <Field label="Card Number">
                  <Input
                    value={formData.card.number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        card: { ...formData.card, number: e.target.value },
                      })
                    }
                  />
                </Field>
              </>
            )}

          </Section>

          {/* NAV */}
          <div className="form-navigation">

            <Button variant="ghost" onClick={() => navigate("/home")}>
              Close
            </Button>

            <div style={{ display: "flex", gap: 10 }}>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={prevStep}>
                  Back
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>Next</Button>
              ) : (
                <Button onClick={handleSave} disabled={saving}>
                  Save
                </Button>
              )}
            </div>

          </div>

          {error && <div className="error">{error}</div>}

        </Card>

        {/* RIGHT */}
        <Card variant="soft">
          <Section
            title="Profile Guide"
            meta="Add details to improve visibility and trust"
          />
        </Card>

      </div>

    </div>
  );
}