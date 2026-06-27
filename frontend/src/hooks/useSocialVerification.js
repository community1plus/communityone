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
   

try {

  console.log(
    `Refreshing profile after ${social} verification...`
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
    "❌ Verification refresh failed",
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