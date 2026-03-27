import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";
import { getCurrentUser } from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const didNavigateRef = useRef(false);
  const popupRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // ✅ Redirect once authenticated
  const handleAuthed = () => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    navigate("/home", { replace: true });
  };

  // ✅ Popup login handler
  const openCognitoPopup = (provider) => {
    const domain =
      "https://communityone-auth.auth.ap-southeast-2.amazoncognito.com";
    const clientId = "1h8emkpkl4eenlrtlo72394enb";
    const redirectUri = encodeURIComponent(window.location.origin + "/");

    const url = `${domain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&identity_provider=${provider}`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      url,
      "cognitoLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // 🚨 fallback if popup blocked
    if (!popup) {
      window.location.href = url;
      return;
    }

    popupRef.current = popup;
    setLoading(true);
  };

  // ✅ Detect login + close popup
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          setLoading(false);

          // close popup if open
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }

          handleAuthed();
        }
      } catch {
        // not logged in yet
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Initial session check
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) handleAuthed();
      } catch {}
    };

    checkUser();
  }, []);

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
            {/* 🔥 Facebook */}
            <button
              className="btn signin"
              onClick={() => openCognitoPopup("Facebook")}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Facebook"}
            </button>

            {/* 🔥 Google */}
            <button
              className="btn primary"
              onClick={() => openCognitoPopup("Google")}
              disabled={loading}
            >
              <strong>
                {loading ? "Signing in..." : "Sign in with Google"}
              </strong>
            </button>

            <div className="avatar">A</div>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <div className="hero-grid">
            <div className="headline">
              <h1 className="tagline">
                Real People. <span className="accent">Real News.</span> Real Time
              </h1>

              <p className="sub">
                A map-first local feed that prioritises what’s happening <b>here</b>.
              </p>

              <div className="heroCtas">
                <button className="btn primary" onClick={handleAuthed}>
                  Explore your local area
                </button>
              </div>
            </div>

            <aside className="preview">
              <div className="pulsebar">
                <span className="pulse pulse-live">LIVE • 2 gigs tonight</span>
                <span className="pulse pulse-alert">ALERT • 1 incident</span>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <div>© Community One</div>
        </div>
      </footer>
    </div>
  );
}