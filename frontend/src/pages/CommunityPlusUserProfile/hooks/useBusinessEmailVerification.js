import {
  useCallback,
  useState,
} from "react";

export default function useBusinessEmailVerification({
  values,
  patchProfile,
}) {

  const [
    businessEmailStatus,
    setBusinessEmailStatus,
  ] = useState("idle");

  const [
    businessEmailError,
    setBusinessEmailError,
  ] = useState("");

  const sendBusinessEmailCode =
    useCallback(async () => {

      try {

        setBusinessEmailStatus(
          "sending"
        );

        // backend call

        setBusinessEmailStatus(
          "sent"
        );

      } catch (err) {

        setBusinessEmailStatus(
          "error"
        );

        setBusinessEmailError(
          err?.message ||
          "Unable to send email"
        );

      }

    }, []);

  const verifyBusinessEmailCode =
    useCallback(async () => {

      try {

        setBusinessEmailStatus(
          "verifying"
        );

        await patchProfile({
          organisation: {
            ...values.organisation,
            emailVerified: true,
          },
        });

        setBusinessEmailStatus(
          "verified"
        );

      } catch (err) {

        setBusinessEmailStatus(
          "error"
        );

        setBusinessEmailError(
          err?.message ||
          "Verification failed"
        );

      }

    }, [
      values,
      patchProfile,
    ]);

  return {
    businessEmailStatus,
    businessEmailError,

    sendBusinessEmailCode,
    verifyBusinessEmailCode,
  };
}