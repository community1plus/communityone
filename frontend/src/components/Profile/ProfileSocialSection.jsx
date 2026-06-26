// src/components/Profile/ProfileSocialSection.jsx

import useSocialVerification from "../../hooks/useSocialVerification";
import useAPI from "../../hooks/useAPI";
import { API_BASE } from "../../services/api";

export default function ProfileSocialSection() {

  useSocialVerification();

  console.log(
    "PROFILE SOCIAL SECTION LOADED"
  );

  const { post } = useAPI();

  const providers = [

    {
      id: "facebook",
      icon: "ⓕ",
      name: "Facebook",
      verified: Boolean(profile?.social?.facebook?.verified),
      route: "/facebook/start",
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
              ? "Verified"
              : "Not Verified"}

          </div>

<button
  type="button"
  className="social-action"
onClick={async () => {

  console.log("STEP 1");

  try {

    const result = await post("/facebook/begin");

    console.log("STEP 2", result);

    console.log("Navigating...");

    window.location.assign(
      `${API_BASE}${provider.route}`
    );

  } catch (err) {

    console.error("BEGIN FAILED", err);

  }

}}
>

  {provider.verified
    ? "Verified ✓"
    : "Verify →"}

</button>

        </div>

      ))}

    </div>

  );

}