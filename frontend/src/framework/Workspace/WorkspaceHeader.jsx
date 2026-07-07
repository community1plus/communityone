import "./WorkspaceHeader.css";

export default function WorkspaceHeader({

    title,
    subtitle,
    onClose,

}) {

    return (

<header className="workspace-header">

    <div className="workspace-header-row">

        <h1>{title}</h1>

        {subtitle && (

            <p className="workspace-header-subtitle">

                {subtitle}

            </p>

        )}

        {onClose && (

            <button
                type="button"
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