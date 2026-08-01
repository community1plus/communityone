import "./WorkspaceHeader.css";
import WorkspaceStatus from "../Workspace/WorkspaceStatus";
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

    <pre>

        {JSON.stringify(model, null, 2)}

    </pre>

</header>



    );

}