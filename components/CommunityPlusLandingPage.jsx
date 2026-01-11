import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "../src/CommunityPlusLandingPage.css";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="cpl-root">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand">
            <div className="logo">COMMUNITY ONE</div>

            <div className="loc">
              <button className="pill" type="button">
                <span className="dot" />
                <span>St Kilda, VIC</span>
                <span className="pillCaret">▾</span>
              </button>
            </div>
          </div>

          <nav className="nav">
            <a href="#">Home</a>
            <a href="#">Live</a>
            <a href="#">Events</a>
            <a href="#">Incidents</a>
            <a href="#">About</a>
          </nav>

          <div className="actions">
            {/* ✅ SIGN IN BUTTON */}
            <button className="btn" onClick={() => setShowAuth(true)}>
              Sign in
            </button>

            <button className="btn primary" onClick={() => setShowAuth(true)}>
              <strong>Join</strong>
            </button>

            <div className="avatar">A</div>
          </div>
        </div>
      </header>

      {/* rest of your page unchanged */}
      {/* ... */}

      {/* ============================
          AUTH MODAL
         ============================ */}
      {showAuth && (
        <div className="cpl-modalOverlay">
          <div className="cpl-modal">
            <div className="cpl-modalHeader">
              <strong>Sign in to Community+</strong>
              <button className="btn" onClick={() => setShowAuth(false)}>
                Close
              </button>
            </div>

            <div className="cpl-modalBody">
              <Authenticator>
                {({ user }) => {
                  if (user) {
                    // avoid render loop
                    setTimeout(() => {
                      setShowAuth(false);
                      navigate("/home", { replace: true });
                    }, 0);
                  }
                  return null;
                }}
              </Authenticator>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
