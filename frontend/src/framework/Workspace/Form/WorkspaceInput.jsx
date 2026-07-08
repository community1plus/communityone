import "./WorkspaceInput.css";

export default function WorkspaceInput({

    ...props

}) {

    return (

        <input
            className="workspace-input"
            {...props}
        />

    );

}