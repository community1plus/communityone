import "./WorkspaceHeader.css";
import WorkspaceMeta from "../Workspace/WorkspaceMeta";
import WorkspaceIdentity from "../Workspace/WorkspaceIdentity";
import WorkspaceCompletion from "../Workspace/WorkspaceCompletion";

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


<WorkspaceMeta>

    <WorkspaceCompletion
        model={meta}
    />
    
</WorkspaceMeta>

)}

        </header>

    );

}