import WorkspaceClose from "./WorkspaceClose";

export default function WorkspaceShell({

    children,
    onClose,

}) {

    return (

<div className="workspace-shell">

    <WorkspaceClose
        onClick={onClose}
    />

    <div className="workspace-layout">

        {children}

    </div>

</div>

    );

}