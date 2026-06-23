export default function ProfileHelpPanel({
  section,
}) {

  switch (section) {

    case "user-profile":

      return (
        <>
          <h2>Profile Tips</h2>

          <p>
            Your display name is visible to
            the community.
          </p>

          <p>
            Choose a username that identifies
            your organisation.
          </p>

          <p>
            Usernames cannot contain spaces.
          </p>
        </>
      );

    case "home-address":

      return (
        <>
          <h2>Location</h2>

          <p>
            This address becomes your home
            location.
          </p>

          <p>
            It determines where your content
            appears.
          </p>
        </>
      );

    case "contact":

      return (
        <>
          <h2>Contact Verification</h2>

          <p>
            Verify your phone number to
            improve account security.
          </p>
        </>
      );

    case "social":

      return (
        <>
          <h2>Social Verification</h2>

          <p>
            Connect your official accounts.
          </p>

          <p>
            Verified accounts improve trust.
          </p>
        </>
      );

    case "payment":

      return (
        <>
          <h2>Billing</h2>

          <p>
            Payments are securely handled
            through Stripe.
          </p>
        </>
      );

    default:

      return null;

  }

}