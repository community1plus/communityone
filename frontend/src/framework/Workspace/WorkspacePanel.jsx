import "./WorkspacePanel.css";

export default function WorkspacePanel({

    title,

    children,

}) {

    return (

        <section className="workspace-panel">

            {title && (

                <header className="workspace-panel-header">

                    {title}

                </header>

            )}

            <div className="workspace-panel-body">

                {children}

            </div>

        </section>

    );

}