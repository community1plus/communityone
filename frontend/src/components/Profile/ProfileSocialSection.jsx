export default function ProfileSocialSection() {

  return (

    <div className="social-verification-list">

      <div className="social-verification-row">

        <div>

          <strong>Facebook</strong>

          <div>Not connected</div>

        </div>

        <button className="social-connect-button">

          Connect →

        </button>

      </div>

      <div className="social-verification-row">

        <div>

          <strong>Instagram</strong>

          <div>Connected ✓</div>

        </div>

        <button>

          Manage →

        </button>

      </div>

    </div>

  );

}