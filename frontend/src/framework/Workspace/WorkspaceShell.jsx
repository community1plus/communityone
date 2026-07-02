import "./WorkspaceShell.css";

export default function WorkspaceShell({

    children,

}) {

    return (

        <div className="workspace-page">

            <div className="workspace-container">

                <div className="workspace-layout">

                    {children}

                </div>

            </div>

        </div>

    );

}