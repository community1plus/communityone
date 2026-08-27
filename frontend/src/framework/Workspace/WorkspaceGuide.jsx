import "./WorkspaceGuide.css";

export default function WorkspaceGuide({

    title,

    children,

}) {

    return (

        <section className="workspace-guide">

            <header className="workspace-guide-header">

                <h2 className="workspace-guide-title">

                    {title}

                </h2>

            </header>


            <div className="workspace-guide-body">

                {children}

            </div>

        </section>

    );

}