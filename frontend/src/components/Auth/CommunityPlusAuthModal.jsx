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

  return (
    <div className="cpl-modalOverlay" onClick={onClose}>
      <div className="cpl-authModal" onClick={(e) => e.stopPropagation()}>
        <h2>Sign in to Community.One</h2>

        <CommunityPlusEmailForm onSuccess={onSuccess} />

        <div className="auth-divider">or</div>

        <button
          type="button"
          className="social-login google"
          onClick={handleGoogleLogin}
        >
         
            <span className="gsi-material-button-icon">
              G
            </span>
            <span className="gsi-material-button-contents">Google</span>
          
        </button>

        <button type="button" className="social-login facebook">
          
          <span className="social-label">Facebook</span>
        </button>

        <div className="auth-links">
          <button type="button" className="auth-text-link" onClick={onJoin}>
            Join Community.One
          </button>

          <span className="auth-link-divider">•</span>

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