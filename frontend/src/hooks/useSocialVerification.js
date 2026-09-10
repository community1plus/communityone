import { useEffect, useRef } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useProfile,
} from "../context/ProfileContext";


// ============================================================
// SOCIAL VERIFICATION CALLBACK
// ============================================================

export default function useSocialVerification() {

  const processedRef = useRef(false);

  const [searchParams] =
    useSearchParams();

  const navigate =
    useNavigate();

  const {
    loadProfile,
    patchProfile,
  } = useProfile();


  // ==========================================================
  // CALLBACK PARAMETERS
  // ==========================================================

  const social =
    searchParams.get("social");

  const verified =
    searchParams.get("verified");

  const reason =
    searchParams.get("reason");


  // ==========================================================
  // VERIFICATION CALLBACK
  // ==========================================================

  useEffect(() => {

    // --------------------------------------------------------
    // Ignore normal profile loads
    // --------------------------------------------------------

    if (!social || !verified) {
      return;
    }


    // --------------------------------------------------------
    // Only process successful verification here
    // --------------------------------------------------------

    if (verified !== "true") {

      console.warn(
        "⚠️ Social verification failed:",
        {
          social,
          reason,
        }
      );

      return;
    }


    // --------------------------------------------------------
    // Prevent duplicate processing
    // --------------------------------------------------------

    if (processedRef.current) {
      return;
    }

    processedRef.current = true;


    // --------------------------------------------------------
    // Complete verification
    // --------------------------------------------------------

    async function completeVerification() {

      try {

        console.log(
          "=== SOCIAL VERIFICATION CALLBACK ==="
        );

        console.log(
          "Provider:",
          social
        );

        console.log(
          "Verified:",
          verified
        );


        // ====================================================
        // LOAD FRESH PROFILE
        // ====================================================

        console.log(
          `Refreshing profile after ${social} verification...`
        );

        const refreshedProfile =
          await loadProfile({
            background: false,
          });


        console.log(
          "✅ Profile refreshed after social verification:",
          refreshedProfile
        );


        // ====================================================
        // REMOVE CALLBACK PARAMETERS
        // ====================================================

        navigate(
          "/communityplus/profile",
          {
            replace: true,
          }
        );


        console.log(
          "✅ Social verification callback completed"
        );

      } catch (err) {

        console.error(
          "❌ Social verification callback failed:",
          err
        );

        // Allow a future callback to be processed
        // if the current attempt failed.
        processedRef.current = false;
      }

    }


    completeVerification();

  }, [
    social,
    verified,
    reason,
    loadProfile,
    navigate,
  ]);

}