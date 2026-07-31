export default function WorkspaceGuide({

    children,

}) {

    return (

        <aside className="workspace-guide">

            <div className="workspace-guide-header">

                Guide

            </div>

            <div className="workspace-guide-body">

                {children}

            </div>

        </aside>

    );

}