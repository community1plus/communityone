export default function ProfileHelpPanel({
  section,
}) {

  switch (section) {

    /* =====================================
       IDENTITY
    ===================================== */

    case "identity":

      return (
        <>
          <h2>Your Identity</h2>

          <p>
            Your identity is how you are known
            within Community One.
          </p>

          <p>
            Your name is visible to the
            community and becomes your public
            identity across the platform.
          </p>

          <p>
            Your email address is private and
            is only used for authentication,
            notifications and account recovery.
          </p>
        </>
      );

    /* =====================================
       LOCATION
    ===================================== */

    case "location":

      return (
        <>
          <h2>Home Location</h2>

          <p>
            Your home location connects you to
            your local community.
          </p>

          <p>
            Community One uses this location
            to deliver nearby information,
            services and events.
          </p>

          <p>
            Your exact address is never shown
            publicly.
          </p>
        </>
      );

    /* =====================================
       CONTACT
    ===================================== */

    case "contact":

      return (
        <>
          <h2>Contact</h2>

          <p>
            Adding a phone number improves
            account security and recovery.
          </p>

          <p>
            It will also support emergency
            services and verification features
            as Community One evolves.
          </p>
        </>
      );

    /* =====================================
       SOCIAL
    ===================================== */

    case "social":

      return (
        <>
          <h2>Connected Accounts</h2>

          <p>
            Connect your social accounts to
            share content across platforms.
          </p>

          <p>
            Verified accounts help establish
            authenticity and increase trust
            within the community.
          </p>

          <p>
            You can disconnect any account at
            any time.
          </p>
        </>
      );

    /* =====================================
       PAYMENT
    ===================================== */

    case "payment":

      return (
        <>
          <h2>Payments</h2>

          <p>
            Payment methods are only required
            for premium services, advertising
            and marketplace features.
          </p>

          <p>
            Card information is securely
            managed by Stripe and is never
            stored directly by Community One.
          </p>
        </>
      );

    default:

      return (
        <>
          <h2>Community Profile</h2>

          <p>
            Your Community Profile is your
            trusted identity within Community
            One.
          </p>

          <p>
            Complete each section to unlock
            additional features as they become
            available.
          </p>
        </>
      );

  }

}