// src/components/Profile/ProfileSocialSection.jsx

export default function ProfileSocialSection() {
  const providers = [
    {
      id: "facebook",
      icon: "ⓕ",
      name: "Facebook",
      verified: false,
    },
    {
      id: "instagram",
      icon: "📸",
      name: "Instagram",
      verified: false,
    },
    {
      id: "youtube",
      icon: "▶",
      name: "YouTube",
      verified: false,
    },
    {
      id: "x",
      icon: "𝕏",
      name: "X",
      verified: false,
    },
  ];

  return (
    <div className="social-settings">

      {providers.map((provider) => (

        <div
          key={provider.id}
          className="social-row"
        >

          <div className="social-provider">

            <span className="social-icon">
              {provider.icon}
            </span>

            <span className="social-name">
              {provider.name}
            </span>

          </div>

<div
  className={
    provider.verified
      ? "social-status verified"
      : "social-status"
  }
>
  {provider.verified
    ? "✓ Verified"
    : "Not Verified"}
</div>

{!provider.verified && (

  <button
    type="button"
    className="social-action"
  >
    Verify →
  </button>

)}

        </div>

      ))}

    </div>
  );
}