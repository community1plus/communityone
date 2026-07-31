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

<WorkspaceIdentity

    title={title}

    subtitle={subtitle}

/>

            {meta && (

                <div className="workspace-header-meta">

                    <WorkspaceMeta>
                        {meta}
                    </WorkspaceMeta>

                </div>

            )}

        </header>

    );

}