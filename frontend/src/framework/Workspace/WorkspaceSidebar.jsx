export default function WorkspaceSidebar({

    guide,
    actions,

}) {

    return (

        <aside className="workspace-sidebar">

            <div className="workspace-guide">

                {guide}

            </div>

            <div className="workspace-actions">

                {actions}

            </div>

        </aside>

    );

}