import "./WorkspaceShell.css";

export default function WorkspaceShell({

    children,

}) {

    return (

        <div className="workspace-shell">

            <div className="workspace-layout">

                {children}

            </div>

        </div>

    );

}