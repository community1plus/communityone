const sendPhoneCode = useCallback(async () => {
  const cleanPhone = toE164Phone(
    values.phone,
    values.phoneCountry
  );

  if (!cleanPhone) {
    setPhoneError("Enter your phone number first.");
    return;
  }

  if (
    !isValidInternationalPhone(
      values.phone,
      values.phoneCountry
    )
  ) {
    setPhoneError(
      `Enter a valid phone number for ${selectedPhoneCountry.label}.`
    );
    return;
  }

  setPhoneStatus("sending");
  setPhoneError("");
  setValue("phoneVerificationCode", "");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/send-phone-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send verification code");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Verification send failed");
    }

    setPhoneStatus("sent");
  } catch (err) {
    console.error(err);

    setPhoneStatus("error");

    setPhoneError(
      err?.message ||
        "Could not send verification code"
    );
  }
}, [
  values.phone,
  values.phoneCountry,
  selectedPhoneCountry.label,
  setValue,
]);