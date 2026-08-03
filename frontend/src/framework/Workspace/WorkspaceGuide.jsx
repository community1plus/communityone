import "./WorkspaceGuide.css";

export default function WorkspaceGuide({

    title = "Guide",

    children,

    footer,

}) {

    return (

        <aside className="workspace-guide">

            <header className="workspace-guide-header">

                <h3>{title}</h3>

            </header>

            <div className="workspace-guide-body">

                {children}

            </div>

            {footer && (

                <footer className="workspace-guide-footer">

                    {footer}

                </footer>

            )}

        </aside>

    );

}