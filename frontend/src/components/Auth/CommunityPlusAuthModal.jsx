import { signInWithRedirect } from "aws-amplify/auth";
import CommunityPlusEmailForm from "./CommunityPlusEmailForm";

export default function CommunityPlusAuthModal({
  onClose,
  onSuccess,
  onJoin,
  onForgotPassword,
}) {
  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect({
        provider: "Google",
      });
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithRedirect({
        provider: "Facebook",
      });
    } catch (err) {
      console.error("Facebook sign-in failed:", err);
    }
  };

  return (
    <div className="cpl-modalOverlay" onClick={onClose}>
      <div
        className="cpl-authModal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Sign in to Community.One</h2>

        <CommunityPlusEmailForm onSuccess={onSuccess} />

        <div className="auth-divider">or</div>

        {/* GOOGLE */}

        <button
          type="button"
          className="social-login google"
          onClick={handleGoogleLogin}
          aria-label="Continue with Google"
        >
          <span className="social-logo-box">
            <img
              src="/google-icon.png"
              alt=""
              className="social-logo google-logo"
              aria-hidden="true"
            />
          </span>

          <span className="social-label">
            Continue with Google
          </span>
        </button>

        {/* FACEBOOK */}

        <button
          type="button"
          className="social-login facebook"
          onClick={handleFacebookLogin}
          aria-label="Continue with Facebook"
        >
          <span className="social-logo-box">
            <img
              src="/facebook-icon.png"
              alt=""
              className="social-logo facebook-logo"
              aria-hidden="true"
            />
          </span>

          <span className="social-label">
            Continue with Facebook
          </span>
        </button>

        {/* LINKS */}

        <div className="auth-links">
          <button
            type="button"
            className="auth-text-link"
            onClick={onJoin}
          >
            Join Community.One
          </button>

          <span className="auth-link-divider">
            •
          </span>

          <button
            type="button"
            className="auth-text-link"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}