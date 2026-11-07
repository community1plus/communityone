import { useEffect, useState } from "react";
import { useProfile } from "../../../context/ProfileContext";
import PhoneField from "./fields/PhoneField";

export default function VerifiedPhoneField({
    field,
    form,
    editing,
}) {
    const {
        profile,
        loadProfile,
        startAccountPhoneVerification,
        confirmAccountPhoneVerification,
    } = useProfile();

    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    const phone = field
        ? form.getValue(field.name) ?? ""
        : "";

    const phoneCountry =
        form.getValue("phoneCountry") ?? "AU";

    const statusLoaded =
        profile != null &&
        typeof profile.phoneVerified === "boolean";

    const savedPhone =
        profile?.phoneDisplay ?? profile?.phone ?? "";

    const savedCountry =
        profile?.phoneCountry ?? "AU";

    const currentPhoneMatchesSaved =
        String(phone).trim() === String(savedPhone).trim() &&
        phoneCountry === savedCountry;

    const verified =
        statusLoaded &&
        profile.phoneVerified === true &&
        currentPhoneMatchesSaved;

    useEffect(() => {
        setCode("");
        setCodeSent(false);
        setMessage("");
        setError("");
    }, [phone, phoneCountry]);

    const handleSendCode = async () => {
        setBusy(true);
        setMessage("");
        setError("");

        try {
            await startAccountPhoneVerification();

            setCodeSent(true);
            setMessage(
                "Verification code sent. Check your phone."
            );
        } catch (err) {
            setError(
                err?.message ||
                "Unable to send the verification code."
            );
        } finally {
            setBusy(false);
        }
    };

    const handleConfirmCode = async () => {
        setBusy(true);
        setMessage("");
        setError("");

        try {
            await confirmAccountPhoneVerification(code);

            await loadProfile({
                background: false,
            });

            setCode("");
            setCodeSent(false);
            setMessage(
                "Phone number verified successfully."
            );
        } catch (err) {
            setError(
                err?.message ||
                "Unable to verify this phone number."
            );
        } finally {
            setBusy(false);
        }
    };

    if (!field) {
        return null;
    }

    return (
        <>
            <PhoneField
                field={field}
                form={form}
                editing={editing}
            />

            <div className="verified-email-status">
                {!statusLoaded ? (
                    <span>Checking verification status...</span>
                ) : verified ? (
                    <span className="social-account-verified">
                        {"\u2713 Verified"}
                    </span>
                ) : (
                    <span>Not verified</span>
                )}
            </div>

            {statusLoaded && !verified && (
                <div className="verified-email-actions">
                    {editing ? (
                        <p>
                            Save your phone number before requesting
                            a verification code.
                        </p>
                    ) : !currentPhoneMatchesSaved ? (
                        <p>
                            Save your updated phone number before
                            requesting verification.
                        </p>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="social-account-verify"
                                disabled={busy || !phone}
                                onClick={handleSendCode}
                            >
                                {busy
                                    ? "Please wait..."
                                    : "Send verification code"}
                            </button>

                            {codeSent && (
                                <>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        value={code}
                                        onChange={(event) =>
                                            setCode(
                                                event.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6)
                                            )
                                        }
                                        placeholder="6-digit code"
                                        aria-label="Phone verification code"
                                        disabled={busy}
                                    />

                                    <button
                                        type="button"
                                        className="social-account-verify"
                                        disabled={
                                            busy ||
                                            !/^\d{6}$/.test(code)
                                        }
                                        onClick={handleConfirmCode}
                                    >
                                        Verify phone
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {message && (
                <p role="status">{message}</p>
            )}

            {error && (
                <p role="alert">{error}</p>
            )}
        </>
    );
}
