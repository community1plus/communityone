export default function WorkspaceContext({

    mode,
    meta,
    actions,

}) {

    return (

        <section className="workspace-context">

            <div className="workspace-context-mode">

                {mode}

            </div>

            <div className="workspace-context-right">

                {meta && (

                    <div className="workspace-context-meta">

                        {meta}

                    </div>

                )}

                {actions && (

                    <div className="workspace-context-actions">

                        {actions}

                    </div>

                )}

            </div>

        </section>

    );

}