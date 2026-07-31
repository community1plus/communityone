import "./WorkspaceHeader.css";
import WorkspaceStatus from "../Workspace/components/WorkspaceStatus";

export default function WorkspaceHeader({

    model = {},

}) {

    const {

        title,
        subtitle,

        status,

    } = model;

    return (

        <header className="workspace-header">

            <div className="workspace-header-text">

                {title && <h1>{title}</h1>}

                {subtitle && <p>{subtitle}</p>}

            </div>

            {status && (

                <div className="workspace-header-status">

                    <WorkspaceStatus
                        model={status}
                    />

                </div>

            )}

        </header>

    );

}