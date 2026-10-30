

import { useEffect, useState } from "react";
import { useProfile } from "../../../context/ProfileContext";
import WorkspaceField from "./WorkspaceField";


export default function VerifiedEmailField({
    field,
    form,
    editing,
}) {

console.log(
    "🔥 FIELD RENDERER:",
    field.name,
    "type:",
    field.type,
    "editing:",
    editing,
    "readOnly:",
    field.readOnly
);
    const {
        accountUser,
        loadProfile,
        testAccountEmailVerification,
        confirmAccountEmailVerification,
    } = useProfile();

    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (!field) {
        return null;
    }

    const {
        name,
        label,
        helperText,
    } = field;

    const email = form.getValue(name) ?? "";
    const verificationStatusLoaded =
    accountUser != null &&
    typeof accountUser.emailVerified === "boolean";

const verified =
    verificationStatusLoaded &&
    accountUser.emailVerified;

    useEffect(() => {
    console.log("[EMAIL FIELD TIMING]", {
        time: new Date().toISOString(),
        emailVerified: accountUser?.emailVerified,
        verified,
    });
}, [accountUser?.emailVerified, verified]);

    console.log("[EMAIL VERIFICATION STATE]", {
    email: accountUser?.email,
    emailVerified: accountUser?.emailVerified,
    verified,
});

useEffect(() => {
    console.log(
        "[EMAIL VERIFICATION CHANGED]",
        accountUser?.emailVerified
    );
}, [accountUser?.emailVerified]);

    const handleSendCode = async () => {
        setBusy(true);
        setMessage("");
        setError("");

        try {
            await testAccountEmailVerification();

            setMessage(
                "Verification code sent. Check your email."
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
            await confirmAccountEmailVerification(code);

            await loadProfile({
                background: false,
            });

            setCode("");
            setMessage("Email verified successfully.");
        } catch (err) {
            setError(
                err?.message ||
                "Unable to verify this email address."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <WorkspaceField
            name={name}
            label={label}
            hint={helperText}
        >
            <div className="verified-email-field">
                <input
                    id={name}
                    name={name}
                    type="email"
                    className="workspace-field-input"
                    value={email}
                    readOnly
                    aria-readonly="true"
                />

<div className="verified-email-status">
    {!verificationStatusLoaded ? (
        <span>Checking verification status…</span>
    ) : verified ? (
        <span className="social-account-verified">
            ✓ Verified
        </span>
    ) : (
        <span>Not verified</span>
    )}
</div>
                {verificationStatusLoaded && !verified && (
    <div className="verified-email-actions">
                        <button
                            type="button"
                            className="social-account-verify"
                            disabled={busy || !email}
                            onClick={handleSendCode}
                        >
                            {busy
                                ? "Please wait..."
                                : "Send verification code"}
                        </button>

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
                            aria-label="Email verification code"
                            disabled={busy}
                        />

                        <button
                            type="button"
                            className="social-account-verify"
                            disabled={busy || !/^\d{6}$/.test(code)}
                            onClick={handleConfirmCode}
                        >
                            Verify email
                        </button>
                    </div>
                )}

                {message && (
                    <p role="status">
                        {message}
                    </p>
                )}

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}
            </div>
        </WorkspaceField>
    );
}
