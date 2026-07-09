import "./WorkspaceTextarea.css";

export default function WorkspaceTextarea({

    className = "",
    rows = 4,
    ...props

}) {

    return (

        <textarea
            rows={rows}
            className={`workspace-textarea ${className}`}
            {...props}
        />

    );

}