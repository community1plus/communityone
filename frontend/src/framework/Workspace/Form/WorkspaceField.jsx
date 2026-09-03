import "./WorkspaceField.css";

export default function WorkspaceField({

    name,

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


            {/* =============================================
               LABEL
            ============================================= */}

            {label && (

                <label
                    className="workspace-field-label"
                    htmlFor={name}
                >

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
                            className={
                                `workspace-verification-pill ${verificationStatus.status}`
                            }
                        >

                            {verificationStatus.status === "verified"

                                ? "✓ Verified"

                                : "✕ Unverified"

                            }

                        </span>

                    )}

                </label>

            )}


            {/* =============================================
               CONTENT
            ============================================= */}

            <div className="workspace-field-content">


                {hint && (

                    <div className="workspace-field-hint">

                        {hint}

                    </div>

                )}
                {children}


                {error && (

                    <div className="workspace-field-error">

                        {error}

                    </div>

                )}

            </div>

        </div>

    );

}