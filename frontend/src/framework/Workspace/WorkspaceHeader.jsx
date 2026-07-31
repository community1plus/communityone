import "./WorkspaceHeader.css";
import WorkspaceStatus from "./WorkspaceStatus";

export default function WorkspaceHeader({

    model = {},

}) {

    const {

        title,
        subtitle,

        status,

        onClose,

    } = model;

    return (

        <header className="workspace-header">

            <div className="workspace-header-main">

                <div className="workspace-header-text">

                    {title && <h1>{title}</h1>}

                    {subtitle && <p>{subtitle}</p>}

                </div>

                <div className="workspace-header-side">

                    {status && (

                        <div className="workspace-header-status">

                            <WorkspaceStatus
                                model={status}
                            />

                        </div>

                    )}

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

            </div>

        </header>

    );

}