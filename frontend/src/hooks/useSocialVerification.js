import { useEffect, useRef } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import useAPI
  from "../hooks/useAPI";

import {
  useProfile,
} from "../context/ProfileContext";

function getProviderMetadata(social, searchParams) {
  switch (social) {

    case "facebook":
      return {
        providerId: searchParams.get("facebookId"),
        accountName: searchParams.get("name"),
        email: searchParams.get("email"),
        profilePicture: searchParams.get("profilePicture"),
        pageCount: Number(searchParams.get("pageCount") || 0),
      };

case "instagram":
  return {

    providerId:
      searchParams.get("instagramId"),

    username:
      searchParams.get("username"),

    profilePicture:
      searchParams.get("profilePicture"),

    pageId:
      searchParams.get("pageId"),

    followers:
      Number(searchParams.get("followers") || 0),

    mediaCount:
      Number(searchParams.get("mediaCount") || 0),

  };    

case "youtube":

  return {

    providerId:
      searchParams.get("channelId"),

    channelTitle:
      searchParams.get("channelTitle"),

    profilePicture:
      searchParams.get("profilePicture"),

    subscriberCount:
      Number(
        searchParams.get("subscriberCount") || 0
      ),

    videoCount:
      Number(
        searchParams.get("videoCount") || 0
      ),

    viewCount:
      Number(
        searchParams.get("viewCount") || 0
      ),

    customUrl:
      searchParams.get("customUrl"),

    country:
      searchParams.get("country"),

  };

case "x":
  return {

    providerId:
      searchParams.get("username"),

    username:
      searchParams.get("username"),

    displayName:
      searchParams.get("displayName"),

    profileImage:
      searchParams.get("profileImage"),

    verifiedBadge:
      searchParams.get("verifiedBadge") === "true",

    description:
      searchParams.get("description"),

    followers:
      Number(searchParams.get("followers") || 0),

    following:
      Number(searchParams.get("following") || 0),

    tweets:
      Number(searchParams.get("tweets") || 0),

  };

    default:
      return {};
  }
}

export default function useSocialVerification() {

  
  const processedRef = useRef(false);

    const [searchParams] =
    useSearchParams();

  const navigate =
    useNavigate();

  const {
    patchProfile,
  } = useAPI();

  const {
    loadProfile,
  } = useProfile();

  const social =
    searchParams.get("social");

  const verified =
    searchParams.get("verified");

  useEffect(() => {

    async function completeVerification() {

if (
  verified !== "true" ||
  !social
) {
  return;
}

if (processedRef.current) {
  return;
}

processedRef.current = true;

      const now =
        new Date().toISOString();

const providerData = {
  verified: true,
  verifiedBy: social,
  verificationMethod: "oauth",
  verifiedAt: now,
  lastVerifiedAt: now,
  ...getProviderMetadata(social, searchParams),
};

      const payload = {

        social: {

          [social]:
            providerData,

        },

      };

      try {

        await patchProfile(payload);

console.log(
  "✔ Verification saved."
);

await loadProfile({
  background: false,
});

navigate(
  "/communityplus/profile",
  {
    replace: true,
  }
);

      } catch (err) {

        console.error(
          "❌ Verification save failed",
          err
        );

      }

    }

    completeVerification();

  }, [
  social,
  verified,
  searchParams,
  patchProfile,
  loadProfile,
  navigate,
]);

}