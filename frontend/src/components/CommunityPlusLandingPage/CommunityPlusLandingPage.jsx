import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const didNavigateRef = useRef(false);

  const handleAuthed = () => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    setShowAuth(false);
    navigate("/home", { replace: true });
  };

  // ✅ Check if already logged in
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
          </div>

          <div className="actions">
            <button className="btn signin" onClick={() => setShowAuth(true)}>
              Sign in
            </button>

            <button className="btn primary" onClick={() => setShowAuth(true)}>
              <strong>Join</strong>
            </button>
          </div>
        </div>
      </header>

      {/* ✅ AUTH MODAL */}
      {showAuth && (
        <div
          className="cpl-modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="cpl-modal">
            <div className="cpl-modalHeader">
              <div className="cpl-modalTitle">Sign in</div>
              <button
                className="cpl-modalClose"
                onClick={() => setShowAuth(false)}
              >
                Close
              </button>
            </div>

            <div className="cpl-modalBody">
              <div className="cpl-authTheme">
                
                {/* 🔥 SOCIAL LOGIN */}
                <button
                  className="btn social"
                  style={{ width: "100%", marginBottom: "10px" }}
                  onClick={() =>
                    signInWithRedirect({ provider: "Google" })
                  }
                >
                  Continue with Google
                </button>

                <button
                  className="btn social"
                  style={{ width: "100%", marginBottom: "12px" }}
                  onClick={() =>
                    signInWithRedirect({ provider: "Facebook" })
                  }
                >
                  Continue with Facebook
                </button>

                {/* Divider */}
                <div
                  style={{
                    margin: "12px 0",
                    textAlign: "center",
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  — or —
                </div>

                {/* 🔥 EMAIL / PASSWORD (Amplify UI) */}
                <Authenticator>
                  {({ user }) => {
                    useEffect(() => {
                      if (user) handleAuthed();
                    }, [user]);

                    return null;
                  }}
                </Authenticator>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}