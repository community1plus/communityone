export default function WorkspaceContext({

    mode,
    meta,

}) {

    return (

        <section className="workspace-context">

            <div className="workspace-context-mode">

                {mode}

            </div>

            <div className="workspace-context-meta">

                {meta}

            </div>

        </section>

    );

}