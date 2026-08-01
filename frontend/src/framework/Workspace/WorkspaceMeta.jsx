export default function WorkspaceMeta({

    children,

}) {

    return (

        <div className="workspace-meta">

            {children}

        </div>

        <div style={{ background: "yellow" }}>
    {children}
</div>

    );

}