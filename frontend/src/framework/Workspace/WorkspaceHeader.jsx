import "./WorkspaceHeader.css";

export default function WorkspaceHeader({

    model = {},

}) {

    const {
        title,
        subtitle,
        onClose,
    } = model;

    return (

        <header className="workspace-header">

            <div className="workspace-header-main">

                <div className="workspace-header-text">

                    {title && <h1>{title}</h1>}

                    {subtitle && (
                        <p>{subtitle}</p>
                    )}

                </div>

                {onClose && (

                    <button
                        type="button"
                        className="workspace-close"
                        onClick={onClose}
                        aria-label="Close workspace"
                    >
                        ×
                    </button>

                )}

            </div>

        </header>

    );

}