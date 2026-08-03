import "./WorkspaceContext.css";

export default function WorkspaceContext({

    mode,
    indicators,

}) {

    return (

        <section className="workspace-context">

            <div className="workspace-context-mode">

                {mode}

            </div>

            <div className="workspace-context-indicators">

                {indicators}

            </div>

        </section>

    );

}