import "./WorkspaceHeader.css";

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

    <div className="workspace-header-status">
       {status}
       status: "20%"
    </div>

    {onClose && (

        <button>

            ×

        </button>

    )}

</div>

    </div>

</header>

    );

}