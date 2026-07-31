import "./GuideCardHelp.css";

export default function GuideCardHelp({ section }) {
  switch (section) {
    /* =====================================
       IDENTITY
    ===================================== */

    case "identity":
      return (
        <div className="cpf-guide">
          <h2>Identity Guide</h2>

          <p>
            Your public name is visible to the community.
          </p>

          <p>
            Your email remains private.
          </p>

          <p>
            Verified identities receive additional trust indicators.
          </p>
        </div>
      );

    /* =====================================
       LOCATION
    ===================================== */

    case "location":
      return (
        <div className="cpf-guide">
          <h2>Home Location</h2>

          <p>
            Your home location connects you to your local community.
          </p>

          <p>
            Community One uses this location to deliver nearby information,
            services and events.
          </p>

          <p>
            Your exact address is never shown publicly.
          </p>
        </div>
      );

    /* =====================================
       CONTACT
    ===================================== */

    case "contact":
      return (
        <div className="cpf-guide">
          <h2>Contact</h2>

          <p>
            Adding a phone number improves account security and recovery.
          </p>

          <p>
            It will also support emergency services and verification features
            as Community One evolves.
          </p>
        </div>
      );

    /* =====================================
       SOCIAL
    ===================================== */

    case "social":
      return (
        <div className="cpf-guide">
          <h2>Connected Accounts</h2>

          <p>
            Connect your social accounts to share content across platforms.
          </p>

          <p>
            Verified accounts help establish authenticity and increase trust
            within the community.
          </p>

          <p>
            You can disconnect any account at any time.
          </p>
        </div>
      );

    /* =====================================
       PAYMENT
    ===================================== */

    case "payment":
      return (
        <div className="cpf-guide">
          <h2>Payments</h2>

          <p>
            Payment methods are only required for premium services,
            advertising and marketplace features.
          </p>

          <p>
            Card information is securely managed by Stripe and is never
            stored directly by Community One.
          </p>
        </div>
      );

    /* =====================================
       DEFAULT
    ===================================== */

    default:
      return (
        <div className="cpf-guide">
          <h2>Community Profile</h2>

          <p>
            Your Community Profile is your trusted identity within Community
            One.
          </p>

          <p>
            Complete each section to unlock additional features as they become
            available.
          </p>
        </div>
      );
  }
}