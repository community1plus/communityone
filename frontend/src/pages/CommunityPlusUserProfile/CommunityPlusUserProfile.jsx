import React, { useEffect, useState } from "react";
import "./CommunityPlusUserProfile.css";
export default function CommunityPlusProfile({ user }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    streetNumber: "",
    streetName: "",
    suburb: "",
    state: "",
    postcode: "",
    country: "Australia",
    userType: "PERSONAL"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 🔥 Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();

        if (data.profile) {
          setFormData((prev) => ({
            ...prev,
            ...data.profile
          }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await fetch("/api/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      setMessage("✅ Profile saved successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container">

      <h2>Profile Settings</h2>

      <form className="profile-form" onSubmit={handleSubmit}>

        {/* USERNAME */}
        <div className="form-group">
          <label>Username</label>
          <input
            name="username"
            value={formData.username}
            disabled
          />
        </div>

        {/* CONTACT */}
        <h3>Contact</h3>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* ADDRESS */}
        <h3>Address</h3>

        <div className="address-grid">
          <input
            name="streetNumber"
            placeholder="Street No."
            value={formData.streetNumber}
            onChange={handleChange}
          />

          <input
            name="streetName"
            placeholder="Street Name"
            value={formData.streetName}
            onChange={handleChange}
          />

          <input
            name="suburb"
            placeholder="Suburb"
            value={formData.suburb}
            onChange={handleChange}
          />

          <input
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />

          <input
            name="postcode"
            placeholder="Postcode"
            value={formData.postcode}
            onChange={handleChange}
          />
        </div>

        {/* USER TYPE */}
        <h3>Profile Type</h3>

        <div className="form-group">
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

        {/* ACTION */}
        <button className="profile-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {message && <p className="profile-message">{message}</p>}

      </form>
    </div>
  );
}