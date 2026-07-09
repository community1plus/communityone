import "./WorkspaceSelect.css";

export default function WorkspaceSelect({

    children,
    className = "",
    ...props

}) {

    return (

        <select
            className={`workspace-select ${className}`}
            {...props}
        >

            {children}

        </select>

    );

}