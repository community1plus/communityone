import "./WorkspacePanel.css";


export default function WorkspacePanel({

    title,

    children,

}) {

    return (

        <section className="workspace-panel">

            {title && (

                <h3 className="workspace-panel-title">

                    {title}

                </h3>

            )}

            <div className="workspace-panel-content">

                {children}

            </div>

        </section>

    );

}