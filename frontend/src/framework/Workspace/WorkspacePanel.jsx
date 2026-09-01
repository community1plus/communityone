import "./WorkspacePanel.css";

export default function WorkspacePanel({

    title,

    content,

    value,

}) {

    return (

        <section className="workspace-panel">

            {title && (

                <h3 className="workspace-panel-title">

                    {title}

                </h3>

            )}

            {content !== undefined && (

                <div className="workspace-panel-content">

                    {content}

                </div>

            )}

            {value !== undefined && (

                <div className="workspace-panel-value">

                    {value}

                </div>

            )}

        </section>

    );

}