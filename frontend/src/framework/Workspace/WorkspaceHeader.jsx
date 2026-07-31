import "./WorkspaceHeader.css";
import WorkspaceStatus from "../Workspace/components/WorkspaceStatus";

export default function WorkspaceHeader({

    model = {},

}) {

    const {

        title,
        subtitle,

        meta,

    } = model;

    return (

        <header className="workspace-header">

            <div className="workspace-header-text">

                {title && <h1>{title}</h1>}

                {subtitle && <p>{subtitle}</p>}

            </div>

            {meta && (

                <div className="workspace-header-meta">

                    <WorkspaceMeta>
                        {meta}
                    </WorkspaceMeta>

                </div>

            )}
                </div>

            )}

        </header>

    );

}