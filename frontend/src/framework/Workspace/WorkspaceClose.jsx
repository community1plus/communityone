export default function WorkspaceClose({

    onClick,

}) {

    return (

        <button
            type="button"
            className="workspace-close"
            onClick={onClick}
            aria-label="Close Workspace"
        >

            ×

        </button>

    );

}