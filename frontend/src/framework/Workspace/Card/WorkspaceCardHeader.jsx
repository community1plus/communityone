import "./WorkspaceCardHeader.css";

export default function WorkspaceCardHeader({

    title,
    description,

}) {

    return (

        <header className="workspace-card-header">

            <h2>{title}</h2>

            {description && (

                <p>{description}</p>

            )}

        </header>

    );

}