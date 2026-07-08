import "./WorkspaceField.css";

export default function WorkspaceField({

    label,
    children,

}) {

    return (

        <div className="workspace-field">

            {label && (

                <label className="workspace-field-label">

                    {label}

                </label>

            )}

            {children}

        </div>

    );

}