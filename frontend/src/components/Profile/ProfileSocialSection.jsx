// src/components/Profile/ProfileSocialSection.jsx

export default function ProfileSocialSection() {
  return (
    <div className="social-verification-list">

      <div className="social-verification-row">
        <div>
          <strong>Facebook</strong>
          <div>Not Connected</div>
        </div>

        <button className="primary-button">
          Connect
        </button>
      </div>

      <div className="social-verification-row">
        <div>
          <strong>Instagram</strong>
          <div>Not Connected</div>
        </div>

        <button className="primary-button">
          Connect
        </button>
      </div>

      <div className="social-verification-row">
        <div>
          <strong>YouTube</strong>
          <div>Not Connected</div>
        </div>

        <button className="primary-button">
          Connect
        </button>
      </div>

      <div className="social-verification-row">
        <div>
          <strong>X</strong>
          <div>Not Connected</div>
        </div>

        <button className="primary-button">
          Connect
        </button>
      </div>

    </div>
  );
}