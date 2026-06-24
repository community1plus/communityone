// src/components/Profile/ProfileSocialSection.jsx

export default function ProfileSocialSection() {
  const providers = [
    {
      id: "facebook",
      icon: "ⓕ",
      name: "Facebook",
      connected: false,
    },
    {
      id: "instagram",
      icon: "📸",
      name: "Instagram",
      connected: false,
    },
    {
      id: "youtube",
      icon: "▶",
      name: "YouTube",
      connected: false,
    },
    {
      id: "x",
      icon: "𝕏",
      name: "X",
      connected: false,
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
              provider.connected
                ? "social-status connected"
                : "social-status"
            }
          >
            {provider.connected
              ? "Connected ✓"
              : "Not Connected"}
          </div>

          <button
            type="button"
            className="social-action"
          >
            {provider.connected
              ? "Manage →"
              : "Connect →"}
          </button>

        </div>

      ))}

    </div>
  );
}