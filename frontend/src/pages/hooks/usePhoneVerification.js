import { useState, useCallback } from "react";
import {
  toE164Phone,
  validatePhone,
} from "../CommunityPlusUserProfile/profileHelpers";

export default function usePhoneVerification({
  values,
  selectedPhoneCountry,
  setValue,
  patchProfile,
}) {
  const [phoneStatus, setPhoneStatus] =
    useState("idle");

  const [phoneError, setPhoneError] =
    useState("");

  const sendPhoneCode = useCallback(
    async () => {
      const cleanPhone =
        toE164Phone(
          values.phoneDisplay,
          values.phoneCountry
        );

      if (
        !validatePhone(
          cleanPhone,
          values.phoneCountry
        )
      ) {
        setPhoneError(
          `Enter a valid phone number for ${selectedPhoneCountry.label}`
        );

        return;
      }

      try {
        setPhoneStatus("sending");

        // call backend here

        setPhoneStatus("sent");
      } catch (err) {
        setPhoneStatus("error");

        setPhoneError(
          err?.message ||
            "Unable to send code."
        );
      }
    },
    [
      values,
      selectedPhoneCountry,
    ]
  );

  const verifyPhoneCode =
    useCallback(async () => {
      try {
        setPhoneStatus(
          "verifying"
        );

        await patchProfile({
          phone:
            toE164Phone(
              values.phoneDisplay,
              values.phoneCountry
            ),

          phoneVerified: true,
        });

        setPhoneStatus(
          "verified"
        );
      } catch (err) {
        setPhoneStatus(
          "error"
        );

        setPhoneError(
          err?.message ||
            "Verification failed"
        );
      }
    }, [
      values,
      patchProfile,
    ]);

  return {
    phoneStatus,
    phoneError,
    sendPhoneCode,
    verifyPhoneCode,
  };
}