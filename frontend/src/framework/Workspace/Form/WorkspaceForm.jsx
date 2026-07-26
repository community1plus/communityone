import "./WorkspaceForm.css";

export default function WorkspaceForm({

    children,

}) {

    return (

<form
    className="workspace-form"
    onSubmit={(e) => e.preventDefault()}
>
    {children}
</form>

    );

}