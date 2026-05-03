import CommunityPlusEmailForm from "./CommunityPlusEmailForm";

export default function CommunityPlusAuthModal({ onClose, onSuccess }) {
  return (
    <div className="cpl-modalOverlay" onClick={onClose}>
      <div className="cpl-authModal" onClick={(e) => e.stopPropagation()}>
        <h2>Sign in to Community.One</h2>

        <CommunityPlusEmailForm onSuccess={onSuccess}/>

        <div className="auth-divider">or</div>

        <button type="button" className="social-login" disabled>
          Continue with Google
        </button>

        <button type="button" className="social-login" disabled>
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}