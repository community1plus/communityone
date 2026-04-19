return (
  <header className="header">
    <div className="header-row">

      {/* LEFT */}
      <div className="header-left logo-container">
        <img
          src="/logo/logo.png"
          alt="Community One"
          className="logo"
          onClick={() => go("/home")}
        />

        <div className="location-display">
          <span className={`location-pin ${isExactLocation ? "exact" : "editable"}`}>
            📍
          </span>

          <input
            type="text"
            className={`location-input ${isExactLocation ? "locked" : "editable"}`}
            value={manualLocation}
            readOnly={isExactLocation}
            placeholder={isExactLocation ? "Using exact location" : "Enter address"}
            onChange={(e) => {
              if (!isExactLocation) setManualLocation(e.target.value);
            }}
            onBlur={handleManualLocationCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleManualLocationCommit();
            }}
          />
        </div>
      </div>

      {/* CENTER */}
      <div className="header-center">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search"
          />
          <span className="search-enter">⤶</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="header-right">
        {effectiveUser && (
          <div className="user-block" ref={menuRef}>

            {/* USERNAME */}
            <span className="username" title={effectiveUser?.email || ""}>
              {username}
            </span>

            {/* AVATAR + DROPDOWN */}
            <div className="avatar-wrapper">
              <div className="avatar" onClick={toggleMenu}>
                {initials}
              </div>

              {showMenu && (
                <div className="dropdown-menu">
                  <div
                    className="menu-item"
                    onClick={() => {
                      navigate("/profile");
                      setShowMenu(false);
                    }}
                  >
                    Profile Settings
                  </div>

                  <div
                    className="menu-item"
                    onClick={() => {
                      onLogout?.();
                      setShowMenu(false);
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>

    {/* NAV */}
    <nav className="links">
      <button className={isActive("/home") ? "active" : ""} onClick={() => go("/home")}>Home</button>
      <button className={isActive("/post") ? "active" : ""} onClick={() => go("/post")}>Posts</button>
      <button className={isActive("/event") ? "active" : ""} onClick={() => go("/event")}>Events</button>
      <button className={isActive("/incident") ? "active" : ""} onClick={() => go("/incident")}>Incidents</button>
      <button className={isActive("/search") ? "active" : ""} onClick={() => go("/search")}>Search</button>
      <button className={isActive("/communityplus") ? "active" : ""} onClick={() => go("/communityplus")}>Community+</button>
      <button className={isActive("/about") ? "active" : ""} onClick={() => go("/about")}>About</button>
      <button className={isActive("/yellowpages") ? "active" : ""} onClick={() => go("/yellowpages")}>Yellow Pages</button>
      <button className={isActive("/merch") ? "active" : ""} onClick={() => go("/merch")}>Merch</button>
    </nav>
  </header>
);