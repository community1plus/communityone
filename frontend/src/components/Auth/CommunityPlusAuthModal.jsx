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

        <div className="auth-links">
          <button type="button" className="auth-link" onClick={onForgotPassword}>
            Forgot password?
          </button>

          <button type="button" className="auth-link" onClick={onJoin}>
            Join Community.One
          </button>
        </div>

        <div className="auth-divider">or</div>

        <button type="button" className="social-login" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <button type="button" className="social-login" disabled>
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}