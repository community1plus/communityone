return (
  <div className="profile-container">
    
    {/* HEADER */}
    <div className="profile-page-header">
      <h2 className="profile-page-title">
        {mode === "onboarding" ? "Create Profile" : "Profile Settings"}
      </h2>

      {mode === "onboarding" && (
        <div className="profile-page-steps">
          <span className="step active">Identity</span>
          <span className="step">Home Address</span>
          <span className="step">Contact</span>
          <span className="step">Social</span>
          <span className="step">Payment Details</span>
        </div>
      )}
    </div>

    {/* GRID LAYOUT */}
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

          {/* LOCATION */}
          <div className="location-section">
            <label>Home Location</label>

            {googleMapsApiKey && mapsLoaded && !mapsLoadError ? (
              <Autocomplete
                onLoad={(auto) => (autoRef.current = auto)}
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
                Google Maps could not be loaded. Enter manually.
              </p>
            )}

            {!googleMapsApiKey && (
              <p className="error">
                Google Maps API key missing. Manual entry enabled.
              </p>
            )}

            <div className="location-row">
              <span>📍 Home</span>
              <strong>
                {homeLocation?.label || manualAddress || "Not set"}
              </strong>
            </div>

            <div className="location-row">
              <span>📡 Current</span>
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
              <span>🧭 Nearby</span>
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
            Verified users will be able to send SOS alerts. Activation will
            require verification to prevent misuse.
          </p>
        </div>
      </div>

    </div>
  </div>
);