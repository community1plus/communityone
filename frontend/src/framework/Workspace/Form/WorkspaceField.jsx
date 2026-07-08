import "./WorkspaceField.css";

export default function WorkspaceField({

    label,
    hint,
    required = false,
    children,

}) {

    return (

        <div className="workspace-field">

            {label && (

                <label className="workspace-field-label">

                    {label}

                    {required && (

                        <span className="workspace-required">

                            *

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

        </div>

    );

}