import "./WorkspaceHeader.css";
import WorkspaceIdentity from "../Workspace/WorkspaceIdentity";

export default function WorkspaceHeader({

    model = {},

}) {

    const {

        title,
        subtitle,

    } = model;

    return (

        <header className="workspace-header">

            <WorkspaceIdentity
                title={title}
                subtitle={subtitle}
            />

        </header>

    );

}