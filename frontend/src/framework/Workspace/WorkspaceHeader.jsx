import "./WorkspaceHeader.css";

export default function WorkspaceHeader({

    title,
    subtitle,
    onClose,

}) {

    return (

<header className="workspace-header">

    <div className="workspace-header-top">

        <div className="workspace-header-text">

            <h1>{title}</h1>

            {subtitle && <p>{subtitle}</p>}

        </div>

        {onClose && (

            <button
                className="workspace-close"
                onClick={onClose}
            >
                ×
            </button>

        )}

    </div>

</header>

    );

}