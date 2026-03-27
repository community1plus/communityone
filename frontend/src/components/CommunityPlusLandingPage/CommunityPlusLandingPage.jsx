import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusLandingPage.css";

import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const didNavigateRef = useRef(false);

  const handleAuthed = () => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;

    document.body.classList.remove("modal-open");
    setShowAuth(false);

    navigate("/home", { replace: true });
  };

  /* ===============================
     🔥 COMPLETE OAUTH FLOW (FIX)
  =============================== */

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // ✅ CRITICAL: completes Google/Facebook OAuth redirect
        await fetchAuthSession();

        const user = await getCurrentUser();

        if (user) {
          handleAuthed();
        }
      } catch {
        // not signed in yet
      }

      setCheckingAuth(false);
    };

    completeAuth();
  }, []);

  /* ===============================
     🧠 MODAL BODY SCROLL LOCK
  =============================== */

  useEffect(() => {
    if (showAuth) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showAuth]);

  /* ===============================
     ⛔ PREVENT FLASH BEFORE AUTH CHECK
  =============================== */

  if (checkingAuth) return null;

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

      {/* ===============================
          AUTH MODAL
      =============================== */}

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
                {/* 🔥 FULL COGNITO UI (Google + Facebook + Email) */}
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