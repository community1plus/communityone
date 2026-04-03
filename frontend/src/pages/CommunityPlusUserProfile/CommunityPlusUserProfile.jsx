return (
  <div className="profile-container">

    <h2>
      {mode === "onboarding"
        ? "Create your profile"
        : "Profile Settings"}
    </h2>

    <div className="profile-layout">

      {/* LEFT: FORM */}
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

            <Autocomplete
              onLoad={(auto) => (autoRef.current = auto)}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                placeholder="Search your suburb..."
                className="location-input"
              />
            </Autocomplete>

            <div className="location-row">
              <span>📍 Home:</span>
              <strong>{homeLocation?.label || "Not set"}</strong>
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

      {/* RIGHT: GUIDE */}
      <div className="profile-right">

        <div className="profile-guide">

          <h3>Profile Guide</h3>

          <div className="guide-section">
            <strong>Username</strong>
            <p>Your unique identity. Keep it simple and memorable.</p>
          </div>

          <div className="guide-section">
            <strong>Display Name</strong>
            <p>This is what others will see in posts and interactions.</p>
          </div>

          <div className="guide-section">
            <strong>User Type</strong>
            <p>Choose how you participate in the community.</p>
          </div>

          <div className="guide-section">
            <strong>Home Location</strong>
            <p>Used to personalise your local feed and alerts.</p>
          </div>

          <div className="guide-section">
            <strong>GPS</strong>
            <p>Enable live location for real-time updates and Beacon safety features.</p>
          </div>

        </div>

      </div>

    </div>
  </div>
);