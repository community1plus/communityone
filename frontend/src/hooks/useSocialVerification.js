
import { useNavigate } from "react-router-dom";

import useAPI
  from "./useAPI";

import {
  useProfile,
} from "../context/ProfileContext";

import { useEffect } from "react";

import {
  useSearchParams,
} from "react-router-dom";

export default function useSocialVerification() {

  const [searchParams] =
    useSearchParams();

  const social =
    searchParams.get("social");

  const verified =
    searchParams.get("verified");

  useEffect(() => {

    const navigate =
    useNavigate();

const {
    patchProfile,
} = useAPI();

const {
    refreshProfile,
} = useProfile();

if (
    verified !== "true" ||
    !social
){
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

console.log(payload);

  }, [
    social,
    verified,
  ]);

}