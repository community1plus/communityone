// src/components/Profile/ProfileSocialSection.jsx

import { useState } from "react";

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
  return (
    data.username ||
    data.channelTitle ||
    data.accountName ||
    data.displayName ||
    data.email ||
    ""
  );
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

  const [
    busyProvider,
    setBusyProvider,
  ] = useState(null);

  const providers = [
    {
      id: "facebook",
      icon: "ⓕ",
      name: "Facebook",
      data: profile?.social?.facebook || {},
      verified: Boolean(
        profile?.social?.facebook?.verified
      ),
      begin: "/facebook/begin",
      route: "/facebook/start",
    },

    {
      id: "instagram",
      icon: "📸",
      name: "Instagram",
      data: profile?.social?.instagram || {},
      verified: Boolean(
        profile?.social?.instagram?.verified
      ),
      begin: "/instagram/begin",
      route: "/instagram/start",
    },

    {
      id: "youtube",
      icon: "▶",
      name: "YouTube",
      data: profile?.social?.youtube || {},
      verified: Boolean(
        profile?.social?.youtube?.verified
      ),
      begin: "/youtube/begin",
      route: "/youtube/start",
    },

    {
      id: "x",
      icon: "𝕏",
      name: "X",
      data: profile?.social?.x || {},
      verified: Boolean(
        profile?.social?.x?.verified
      ),
      begin: "/x/begin",
      route: "/x/start",
    },
  ];

  return (
    <div className="social-settings">

      {providers.map((provider) => {

        const avatar =
          getAvatar(provider.data);

        const accountLabel =
          getAccountLabel(provider.data);

        const busy =
          busyProvider === provider.id;

        return (

          <div
            key={provider.id}
            className="social-row"
          >

            <div className="social-provider">

              <div className="social-avatar">

                {avatar ? (

                  <img
                    src={avatar}
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

                {accountLabel && (

                  <div className="social-account">
                    {accountLabel}
                  </div>

                )}

              </div>

            </div>

            {provider.verified ? (

              <div className="social-actions">

                <div className="social-badge">
                  ✓ Verified
                </div>

                <button
                  type="button"
                  className="social-action disconnect"
                  disabled={busy}
                  onClick={async () => {

                    const confirmed =
                      window.confirm(
                        `Disconnect ${provider.name}?`
                      );

                    if (!confirmed) {
                      return;
                    }

                    try {

                      setBusyProvider(
                        provider.id
                      );

                      await deleteRequest(
                        `/${provider.id}/disconnect`
                      );

                      await loadProfile({
                        background: false,
                      });

                    } catch (err) {

                      console.error(
                        `${provider.name} disconnect failed`,
                        err
                      );

                    } finally {

                      setBusyProvider(
                        null
                      );

                    }

                  }}
                >
                  {busy
                    ? "Disconnecting..."
                    : "Disconnect"}
                </button>

              </div>

            ) : (

              <button
                type="button"
                className="social-action"
                disabled={busy}
                onClick={async () => {

                  if (
                    !provider.route ||
                    !provider.begin
                  ) {
                    return;
                  }

                  try {

                    setBusyProvider(
                      provider.id
                    );

                    await post(
                      provider.begin
                    );

                    window.location.assign(
                      `${API_BASE}${provider.route}`
                    );

                  } catch (err) {

                    console.error(
                      `${provider.name} verification failed`,
                      err
                    );

                    setBusyProvider(
                      null
                    );

                  }

                }}
              >
                {busy
                  ? "Connecting..."
                  : "Verify →"}
              </button>

            )}

          </div>

        );

      })}

    </div>
  );
}