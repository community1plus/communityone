import "./WorkspaceField.css";

export default function WorkspaceField({

    label,
    hint,
    error,
    required = false,
    valid,
    verificationStatus,
    children,

}) {

    return (

        <div className="workspace-field">

            {label && (

                <label className="workspace-field-label">

                    <span>

                        {label}

                        {required && (

                            <span className="workspace-required">

                                *

                            </span>

                        )}

                    </span>

                    {verificationStatus && (

                        <span
                            className={`workspace-verification-pill ${verificationStatus.status}`}
                        >

                            {verificationStatus.status === "verified"
                                ? "✓ Verified"
                                : "✕ Unverified"}

                        </span>

                    )}

                </label>

            )}

            {children}

            {hint && (

                <div className="workspace-field-hint">

                    {hint}

                </div>

            )}

            {error && (

                <div className="workspace-field-error">

                    {error}

                </div>

            )}

        </div>

    );

}