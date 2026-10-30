
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import CommunityPlusAuthModal from "../../components/Auth/CommunityPlusAuthModal";

import "./CommunityPlusLandingPage.css";
import { useProfile } from "../../context/ProfileContext";

const RETURN_TO_KEY = "communityone_return_to";
const SWITCH_ACCOUNT_KEY = "communityone_open_auth_after_logout";

const ONBOARDING = {
  CHOICE_REQUIRED: "CHOICE_REQUIRED",
  GUEST: "GUEST",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
};


export default function CommunityPlusLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    loading,
    user,
    authLoading,
    isAuthenticated,
    isGuest,
    participation,
    participationLoading,
    participationError,
    emailVerificationRequired,
    updateOnboardingStatus,
    continueAsGuest,
    logout,
  } = useAuth();

  const onboardingStatus =
    participation?.onboardingStatus ?? null;

 
const [showAuth, setShowAuth] = useState(false);
const [choiceBusy, setChoiceBusy] = useState(false);
const [choiceError, setChoiceError] = useState("");

const {
  testAccountEmailVerification,
  confirmAccountEmailVerification,
} = useProfile();

const [verificationCode, setVerificationCode] = useState("");
const [verificationBusy, setVerificationBusy] = useState(false);
const [verificationMessage, setVerificationMessage] = useState("");
const [verificationError, setVerificationError] = useState("");


  const returnTo = useMemo(
    () =>
      location.state?.returnTo ||
      sessionStorage.getItem(RETURN_TO_KEY) ||
      "/communityplus",
    [location.state]
  );

  const hasAuthenticatedIdentity =
    isAuthenticated && !isGuest;

  const needsOnboardingChoice =
    hasAuthenticatedIdentity &&
    onboardingStatus === ONBOARDING.CHOICE_REQUIRED;

  /* =====================================================
     RESTORE NAVIGATION AND AUTH MODAL STATE
  ===================================================== */

  useEffect(() => {
    const state = location.state;

    if (state?.returnTo) {
      sessionStorage.setItem(
        RETURN_TO_KEY,
        state.returnTo
      );
    }

    if (
      state?.openAuthModal ||
      (
        state?.loginRequired &&
        (!isAuthenticated || isGuest)
      )
    ) {
      setShowAuth(true);
    }
  }, [
    location.state,
    isAuthenticated,
    isGuest,
  ]);

  // logout() performs a full navigation. Preserve the request
  // to reopen the modal across that navigation.
  useEffect(() => {
    if (
      sessionStorage.getItem(SWITCH_ACCOUNT_KEY) !== "true"
    ) {
      return;
    }

    sessionStorage.removeItem(SWITCH_ACCOUNT_KEY);
    setShowAuth(true);
  }, []);

  /* =====================================================
     RESOLVE AUTHENTICATED ONBOARDING STATE
  ===================================================== */

  useEffect(() => {
    if (
      loading ||
      authLoading ||
      !hasAuthenticatedIdentity ||
      participationLoading
    ) {
      return;
    }

    // Do not guess when the backend hasn't supplied a status.
    if (!onboardingStatus) {
      return;
    }

    // The user must choose how to participate.
    if (
      onboardingStatus === ONBOARDING.CHOICE_REQUIRED
    ) {
      return;
    }

    // Resume an onboarding flow already in progress.
    if (
      onboardingStatus === ONBOARDING.IN_PROGRESS
    ) {
      if (!location.pathname.includes("/communityplus/profile")) {
        navigate("/communityplus/profile", {
          replace: true,
          state: {
            returnTo,
            profileRequired: true,
          },
        });
      }

      return;
    }

    // An authenticated guest or completed user continues
    // into the requested destination.
    if (
      onboardingStatus === ONBOARDING.GUEST ||
      onboardingStatus === ONBOARDING.COMPLETED
    ) {
      const destination =
        returnTo && returnTo !== "/"
          ? returnTo
          : "/communityplus";

      sessionStorage.removeItem(RETURN_TO_KEY);

      if (location.pathname !== destination) {
        navigate(destination, { replace: true });
      }
    }
  }, [
    loading,
    authLoading,
    hasAuthenticatedIdentity,
    participationLoading,
    onboardingStatus,
    location.pathname,
    returnTo,
    navigate,
  ]);

  /* =====================================================
     AUTHENTICATION ACTIONS
  ===================================================== */

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setChoiceError("");
  };


  
const handleSendVerificationCode = async () => {
  setVerificationBusy(true);
  setVerificationMessage("");
  setVerificationError("");

  try {
    await testAccountEmailVerification();
    setVerificationMessage(
      "Verification code sent. Check your email."
    );
  } catch (error) {
    setVerificationError(
      error?.message || "Unable to send the verification code."
    );
  } finally {
    setVerificationBusy(false);
  }
};

const handleConfirmVerificationCode = async () => {
  setVerificationBusy(true);
  setVerificationMessage("");
  setVerificationError("");

  try {
    await confirmAccountEmailVerification(verificationCode);
    setVerificationCode("");
    setVerificationMessage(
      "Email verified successfully. Refreshing your account status..."
    );

    window.location.reload();
  } catch (error) {
    setVerificationError(
      error?.message || "Unable to verify this email address."
    );
  } finally {
    setVerificationBusy(false);
  }
};


  const openAuth = () => {
    if (hasAuthenticatedIdentity) {
      if (
        onboardingStatus === ONBOARDING.IN_PROGRESS
      ) {
        navigate("/communityplus/profile", {
          replace: true,
          state: {
            returnTo,
            profileRequired: true,
          },
        });
      } else if (
        onboardingStatus !== ONBOARDING.CHOICE_REQUIRED
      ) {
        navigate("/communityplus", {
          replace: true,
        });
      }

      return;
    }

    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
  };

  /* =====================================================
     CONTINUE AS GUEST
  ===================================================== */

  const handleGuestEntry = async () => {
    setChoiceBusy(true);
    setChoiceError("");

    try {
      if (hasAuthenticatedIdentity) {
        // Persist the choice without signing out of Cognito.
        await updateOnboardingStatus("GUEST");
      } else {
        // Preserve anonymous guest browsing.
        await continueAsGuest();
      }

      sessionStorage.removeItem(RETURN_TO_KEY);

      navigate("/communityplus", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "[LANDING] Guest entry failed:",
        error
      );

      setChoiceError(
        error?.message ||
        "Unable to continue as a guest."
      );
    } finally {
      setChoiceBusy(false);
    }
  };

  /* =====================================================
     SET UP MINIMUM PROFILE
  ===================================================== */

  const handleStartMinimumProfile = async () => {
    if (!hasAuthenticatedIdentity) {
      setShowAuth(true);
      return;
    }

    setChoiceBusy(true);
    setChoiceError("");

    try {
      await updateOnboardingStatus("IN_PROGRESS");

      navigate("/communityplus/profile", {
        replace: true,
        state: {
          returnTo,
          profileRequired: true,
        },
      });
    } catch (error) {
      console.error(
        "[LANDING] Profile onboarding failed:",
        error
      );

      setChoiceError(
        error?.message ||
        "Unable to start profile setup."
      );
    } finally {
      setChoiceBusy(false);
    }
  };

  /* =====================================================
     CONTINUE TO APPLICATION
  ===================================================== */

  const handleContinue = () => {
    if (
      onboardingStatus === ONBOARDING.IN_PROGRESS
    ) {
      navigate("/communityplus/profile");
      return;
    }

    navigate("/communityplus", {
      replace: true,
    });
  };

  /* =====================================================
     SWITCH ACCOUNT
  ===================================================== */

  const handleSwitchAccount = async () => {
    sessionStorage.removeItem(RETURN_TO_KEY);
    sessionStorage.setItem(SWITCH_ACCOUNT_KEY, "true");

    localStorage.removeItem("community_guest");

    try {
      await logout();
    } catch (error) {
      sessionStorage.removeItem(SWITCH_ACCOUNT_KEY);

      console.error(
        "[LANDING] Account switch failed:",
        error
      );

      setChoiceError(
        error?.message ||
        "Unable to switch accounts."
      );
    }
  };

  /* =====================================================
     LOADING AND ERROR STATES
  ===================================================== */

  if (
    loading ||
    authLoading ||
    (
      hasAuthenticatedIdentity &&
      participationLoading
    )
  ) {
    return null;
  }


const participationUnavailable =
  hasAuthenticatedIdentity &&
  !emailVerificationRequired &&
  !onboardingStatus &&
  Boolean(participationError);



    console.log("[EMAIL TEST AUTH STATE]", {
  isAuthenticated,
  isGuest,
  hasUser: Boolean(user),
});
  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="cpl-root">
      <div
        className="landing-visual-layer"
        aria-hidden="true"
      >
        <div className="landing-hero-tint" />
        <div className="landing-hero-focus" />
      </div>

      <main className="landing-container">
        <section
          className="landing-hero"
          aria-label="Community.One landing"
        >
          <h1 className="brand-title">
            THE WRKSHOP
          </h1>

          <div className="landing-text">
            <h2 className="landing-tagline">
              People.{" "}
              <span className="accent">News.</span>{" "}
              Events.{" "}
              <span className="accent">Services.</span>
            </h2>

            <p className="landing-sub">
              KEEP BUILDING.
            </p>
          </div>

          <div
            className="landing-actions"
            aria-busy={choiceBusy}
          >
            {!isAuthenticated || isGuest ? (
              <button
                type="button"
                className="btn primary hero-cta"
                onClick={handleGuestEntry}
                disabled={choiceBusy}
              >
                Explore as Guest
              </button>
            ) : needsOnboardingChoice ? (
              <>
                <p className="guest-mode-copy">
                  Choose how you want to participate.
                  You can explore your community with
                  read-only access or set up your minimum
                  profile to contribute.
                </p>

                <button
                  type="button"
                  className="btn primary hero-cta"
                  onClick={handleGuestEntry}
                  disabled={choiceBusy}
                >
                  {choiceBusy
                    ? "Please wait..."
                    : "Continue as Guest"}
                </button>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleStartMinimumProfile}
                  disabled={choiceBusy}
                >
                  Set up minimum profile
                </button>
              </>
            

) : emailVerificationRequired ? (
  <>
    <p className="guest-mode-copy">
      Please verify your email address before continuing.
    </p>

    <button
      type="button"
      className="btn primary hero-cta"
      onClick={handleSendVerificationCode}
      disabled={verificationBusy}
    >
      {verificationBusy
        ? "Please wait..."
        : "Send verification code"}
    </button>

    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={verificationCode}
      onChange={(event) =>
        setVerificationCode(
          event.target.value.replace(/\D/g, "").slice(0, 6)
        )
      }
      placeholder="Enter 6-digit code"
      aria-label="Email verification code"
      disabled={verificationBusy}
    />

    <button
      type="button"
      className="btn secondary"
      onClick={handleConfirmVerificationCode}
      disabled={
        verificationBusy ||
        !/^\d{6}$/.test(verificationCode)
      }
    >
      Verify email
    </button>

    {verificationMessage && (
      <p role="status">{verificationMessage}</p>
    )}

    {verificationError && (
      <p role="alert" className="error">
        {verificationError}
      </p>
    )}

    <button
      type="button"
      className="btn secondary"
      onClick={handleSwitchAccount}
      disabled={verificationBusy}
    >
      Switch account
    </button>
  </>

            ) : participationUnavailable ? (
              <>
                <p role="alert" className="error">
                  Your participation status couldn't be
                  loaded. Please retry before continuing.
                </p>

                <button
                  type="button"
                  className="btn primary hero-cta"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </>
            ) : onboardingStatus === ONBOARDING.IN_PROGRESS ? (
              <button
                type="button"
                className="btn primary hero-cta"
                onClick={handleContinue}
              >
                Continue profile setup
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn primary hero-cta"
                  onClick={handleContinue}
                >
                  Continue
                </button>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleSwitchAccount}
                >
                  Switch account
                </button>
              </>
            )}

            {choiceError && (
              <p role="alert" className="error">
                {choiceError}
              </p>
            )}

            
          </div>
        </section>
      </main>

      <button
        type="button"
        className="landing-login-thumb"
        onClick={openAuth}
        aria-label="Login"
        title="Login"
      >
        <img src="/logo/echo.png" alt="" />
      </button>

      {showAuth && (
        <CommunityPlusAuthModal
          onClose={closeAuth}
          onSuccess={handleAuthSuccess}
        />
      )}

{import.meta.env.DEV && (
  <>
    <button
      type="button"
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 99999,
        padding: "12px 18px",
        background: "#c62828",
        color: "#ffffff",
        border: "3px solid yellow",
        borderRadius: "6px",
        cursor: "pointer",
      }}
      disabled={!isAuthenticated || isGuest}
      onClick={async () => {
        console.log("[EMAIL TEST] Starting verification request");

        try {
          const result = await testAccountEmailVerification();
          console.log("[EMAIL TEST] API result:", result);
          alert(
            "Verification request completed. Check the console and backend logs."
          );
        } catch (error) {
          console.error(
            "[EMAIL TEST] Verification request failed:",
            error
          );
          alert(`Verification request failed: ${error.message}`);
        }
      }}
    >
      Test email verification
    </button>

    {(!isAuthenticated || isGuest) && (
      <p
        style={{
          position: "fixed",
          right: "20px",
          bottom: "70px",
          zIndex: 99999,
        }}
      >
        Sign in to run the email verification test.
      </p>
    )}
  </>
)}
    </div>
  );
}
