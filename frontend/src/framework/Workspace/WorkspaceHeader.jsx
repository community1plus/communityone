import "./WorkspaceHeader.css";
import WorkspaceMeta from "../Workspace/WorkspaceMeta";
import WorkspaceIdentity from "../Workspace/WorkspaceIdentity";
import ProgressRing from "../../components/Identity/Progress/ProgressRing";

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

    <ProgressRing
        model={meta}
    />
    
</WorkspaceMeta>

)}

        </header>

    );

}