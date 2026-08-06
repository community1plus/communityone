import "./WorkspaceMode.css";

export default function WorkspaceMode({

    label,
    children,

}) {

    return (

        <div className="workspace-mode">

            {label && (

                <div className="workspace-meta-label">

                    {label}

                </div>

            )}

            {children}

        </div>

    );

}