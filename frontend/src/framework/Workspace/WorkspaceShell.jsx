import "./WorkspaceShell.css";

export default function WorkspaceShell({

    children,
    onClose,

}) {

    return (

        <div className="workspace-shell">

            <div className="workspace-layout">

                {children}

            </div>

        </div>

    );

}