// src/components/Profile/ProfileSocialSection.jsx

import { useProfile } from "../../context/ProfileContext";

import useSocialVerification from "../../hooks/useSocialVerification";
import useAPI from "../../hooks/useAPI";
import { API_BASE } from "../../services/api";

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

  const { profile } = useProfile();

  const { post } = useAPI();

  console.log("PROFILE SOCIAL SECTION LOADED");
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

  <button
    type="button"
    className="social-action verified"
    disabled
  >
    Verified ✓
  </button>

) : (

  <button
    type="button"
    className="social-action"
onClick={async () => {

  if (!provider.route || !provider.begin) {
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

      ))}

    </div>

  );

}