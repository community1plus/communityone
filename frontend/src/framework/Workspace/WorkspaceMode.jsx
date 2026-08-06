import "./WorkspaceMode.css";
export default function WorkspaceMode({

    children,

}) {

    return (

<WorkspaceMode>

    <span className="workspace-mode-label">

        Mode

    </span>

    <IdentityCapabilitySelector
        values={values}
        setValue={form.setValue}
        readOnly={!editing}
    />

</WorkspaceMode>

    );

}