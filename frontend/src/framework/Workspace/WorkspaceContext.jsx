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

    <div className="workspace-context-spacer" />

    <div className="workspace-context-meta">

        {meta}

    </div>

    <div className="workspace-context-actions">

        {actions}

    </div>

</section>

    );

}