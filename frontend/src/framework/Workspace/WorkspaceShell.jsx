import "./WorkspaceShell.css";

export default function WorkspaceShell({

    header,

    navigation,

    content,

    guide,

}) {

    return (

        <div className="workspace-shell">

            <header className="workspace-header">

                {header}

            </header>

            <div className="workspace-body">

                <aside className="workspace-navigation">

                    {navigation}

                </aside>

                <main className="workspace-content">

                    {content}

                </main>

                <aside className="workspace-guide">

                    {guide}

                </aside>

            </div>

        </div>

    );

}