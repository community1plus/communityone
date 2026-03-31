import React, { useState } from "react";
/**/
export default function CommunityPlusProfile({ user }) {

  const [formData, setFormData] = useState({
    username: user.username,
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    fetch("/api/users/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

  };

  return (

    <div className="profile-container">

      <h2>Profile Settings</h2>

      <form onSubmit={handleSubmit}>

        <label>Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Phone</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <h3>Address</h3>

        <input name="streetNumber" placeholder="Street Number" onChange={handleChange} />
        <input name="streetName" placeholder="Street Name" onChange={handleChange} />
        <input name="suburb" placeholder="Suburb" onChange={handleChange} />
        <input name="state" placeholder="State" onChange={handleChange} />
        <input name="postcode" placeholder="Postcode" onChange={handleChange} />

        <label>User Type</label>

        <select name="userType" onChange={handleChange}>
          <option value="PERSONAL">Personal</option>
          <option value="BUSINESS">Business</option>
          <option value="MIXED">Mixed</option>
          <option value="COMMUNITY_SERVICE">Community Service</option>
          <option value="GOVERNMENT">Government</option>
        </select>

        <button type="submit">Save Profile</button>

      </form>

    </div>
  );
}