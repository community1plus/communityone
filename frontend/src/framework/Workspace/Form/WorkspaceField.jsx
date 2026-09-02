export default function WorkspaceField({

    label,
    hint,
    error,
    required = false,
    valid,
    verificationStatus,
    htmlFor,
    children,

}) {

    return (

        <div className="workspace-field">


            {/* =================================================
               LABEL
            ================================================= */}

            {label && (

                <label
                    className="workspace-field-label"
                    htmlFor={htmlFor}
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
                            className={`workspace-verification-pill ${verificationStatus.status}`}
                        >

                            {verificationStatus.status === "verified"

                                ? "✓ Verified"

                                : "✕ Unverified"}

                        </span>

                    )}

                </label>

            )}


            {/* =================================================
               CONTENT
            ================================================= */}

            <div className="workspace-field-content">

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

        </div>

    );

}