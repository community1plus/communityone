import { useEffect } from "react";

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
      // Instagram-specific fields

    case "youtube":
      // YouTube-specific fields

    case "x":
      // X-specific fields

    default:
      return {};
  }
}

export default function useSocialVerification() {

  const [searchParams] =
    useSearchParams();

  const navigate =
    useNavigate();

  const {
    patchProfile,
  } = useAPI();

  const {
    refreshProfile,
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

        await patchProfile(
          "/",
          payload
        );

        console.log(
          "✔ Verification saved."
        );

        await refreshProfile();

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
    refreshProfile,
    navigate,

  ]);

}