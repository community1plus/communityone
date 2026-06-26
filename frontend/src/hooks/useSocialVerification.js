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
      // YouTube-specific fields

    case "x":
      // X-specific fields

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

        console.log(
          "Saving social verification",
          payload
        );

        await patchProfile(payload);

        console.log(
          "✔ Verification saved."
        );

        const {
            loadProfile,
        } = useProfile();

        await loadProfile();

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
    verified
  ]);

}