// src/components/Profile/ProfileSocialSection.jsx

import { useProfile } from "../../context/ProfileContext";
import useSocialVerification from "../../hooks/useSocialVerification";
import useAPI from "../../hooks/useAPI";
import { API_BASE } from "../../services/api";

function getAvatar(data = {}) {

  return (
    data.profileImage ||
    data.profilePicture ||
    data.picture ||
    data.thumbnail ||
    ""
  );

}

function getAccountLabel(data = {}) {

  const label =
    data.username ||
    data.channelTitle ||
    data.accountName ||
    data.displayName ||
    data.email ||
    "";

  console.log(
    "getAccountLabel()",
    {
      input: data,
      output: label,
    }
  );

  return label;

}

export default function ProfileSocialSection() {

  useSocialVerification();

const {
  profile,
  loadProfile,
} = useProfile();

const {
  post,
  delete: deleteRequest,
} = useAPI();

  console.log("================================");
  console.log("PROFILE SOCIAL SECTION LOADED");
  console.log("PROFILE");
  console.log(profile);
  console.log("SOCIAL OBJECT");
  console.log(profile?.social);

  const providers = [

    {
      id: "facebook",
      icon: "ⓕ",
      name: "Facebook",
      data: profile?.social?.facebook || {},
      verified: Boolean(profile?.social?.facebook?.verified),
      begin: "/facebook/begin",
      route: "/facebook/start",
    },

    {
      id: "instagram",
      icon: "📸",
      name: "Instagram",
      data: profile?.social?.instagram || {},
      verified: Boolean(profile?.social?.instagram?.verified),
      begin: "/instagram/begin",
      route: "/instagram/start",
    },

    {
      id: "youtube",
      icon: "▶",
      name: "YouTube",
      data: profile?.social?.youtube || {},
      verified: Boolean(profile?.social?.youtube?.verified),
      begin: "/youtube/begin",
      route: "/youtube/start",
    },

    {
      id: "x",
      icon: "𝕏",
      name: "X",
      data: profile?.social?.x || {},
      verified: Boolean(profile?.social?.x?.verified),
      begin: "/x/begin",
      route: "/x/start",
    },

  ];

  console.log("PROVIDERS ARRAY");
  console.table(
    providers.map((p) => ({
      provider: p.id,
      verified: p.verified,
      accountLabel: getAccountLabel(p.data),
      rawData: JSON.stringify(p.data),
    }))
  );

  return (

    <div className="social-settings">

      {providers.map((provider) => {

        console.log(
          `----- ${provider.id.toUpperCase()} -----`
        );

        console.log(
          "RAW PROVIDER DATA",
          provider.data
        );

        console.log(
          "ACCOUNT LABEL",
          getAccountLabel(provider.data)
        );

        return (

          <div
            key={provider.id}
            className="social-row"
          >

            <div className="social-provider">

<div className="social-avatar">

  {getAvatar(provider.data) ? (

    <img
      src={getAvatar(provider.data)}
      alt={provider.name}
    />

  ) : (

    <span className="social-icon">
      {provider.icon}
    </span>

  )}

</div>

              <div className="social-details">

                <div className="social-name">
                  {provider.name}
                </div>

                <div className="social-account">
                  {getAccountLabel(provider.data)}
                </div>

              </div>

            </div>

{provider.verified ? (

  <div className="social-actions">

  <span className="social-badge">
    ✓ Verified
  </span>

  <button
    type="button"
    className="social-action disconnect"
    onClick={async () => {

      const confirmed = window.confirm(
        `Disconnect your ${provider.name} account?\n\nThis will remove its verification from your profile.`
      );

      if (!confirmed) {
        return;
      }

      try {

        console.log(
          `>>> Disconnecting ${provider.id}`
        );

        const result = await deleteRequest(
          `/${provider.id}/disconnect`
        );

        console.log(
          "DISCONNECT RESULT:",
          result
        );

        await loadProfile({
          background: false,
        });

      } catch (err) {

        console.error(
          `${provider.name} disconnect failed`,
          err
        );

      }

    }}
  >
    Disconnect
  </button>

</div>

) : (

              <button
                type="button"
                className="social-action"
                onClick={async () => {

                  if (
                    !provider.route ||
                    !provider.begin
                  ) {
                    return;
                  }

                  try {

                    console.log(
                      `Starting ${provider.name} verification...`
                    );

                    const result =
                      await post(provider.begin);

                    console.log(
                      "BEGIN RESULT:",
                      result
                    );

                    window.location.assign(
                      `${API_BASE}${provider.route}`
                    );

                  } catch (err) {

                    console.error(
                      `${provider.name} BEGIN FAILED`,
                      err
                    );

                  }

                }}
              >
                Verify →
              </button>

            )}

          </div>

        );

      })}

    </div>

  );

}