import "./WorkspaceIdentity.css";
export default function WorkspaceIdentity({

    title,
    subtitle,

}) {

    return (

        <div className="workspace-identity">

            {title && <h1>{title}</h1>}

            {subtitle && <p>{subtitle}</p>}

        </div>

    );

}