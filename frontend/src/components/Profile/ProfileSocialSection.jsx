// src/components/Profile/ProfileSocialSection.jsx

import { useProfile } from "../../context/ProfileContext";

import useSocialVerification from "../../hooks/useSocialVerification";
import useAPI from "../../hooks/useAPI";
import { API_BASE } from "../../services/api";

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
    verified: Boolean(profile?.social?.facebook?.verified),
    begin: "/facebook/begin",
    route: "/facebook/start",
  },

  {
    id: "instagram",
    icon: "📸",
    name: "Instagram",
    verified: Boolean(profile?.social?.instagram?.verified),
    begin: "/instagram/begin",
    route: "/instagram/start",
  },

  {
    id: "youtube",
    icon: "▶",
    name: "YouTube",
    verified: Boolean(profile?.social?.youtube?.verified),
    begin: "/youtube/begin",
    route: "/youtube/start",
  },

  {
    id: "x",
    icon: "𝕏",
    name: "X",
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

  <span className="social-name">
    {provider.name}
  </span>

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
      `Starting ${provider.id.name} verification...`
    );

    const result =
      await post('/${provider.id}.begin');

    console.log(
      "BEGIN RESULT:",
      result
    );

    window.location.assign(
      `${API_BASE}${provider.id.route}`
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