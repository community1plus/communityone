import { useEffect } from "react";

import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import useAPI
  from "../hooks/useAPI";

import {
  useProfile,
} from "../context/ProfileContext";

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

      const payload = {

        social: {

          [social]: {

            verified: true,

            verifiedAt:
              new Date().toISOString(),

          },

        },

      };

      console.log(
        "Saving social verification",
        payload
      );

      await patchProfile(
        payload
      );

      await refreshProfile();

      navigate(
        "/communityplus/profile",
        {
          replace: true,
        }
      );

    }

    completeVerification();

  }, [
    social,
    verified,
    patchProfile,
    refreshProfile,
    navigate,
  ]);

}