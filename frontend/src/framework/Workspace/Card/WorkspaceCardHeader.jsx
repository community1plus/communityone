export default function WorkspaceCardHeader({

    title,
    description,

}) {

    return (

        <header className="workspace-card-header">

            <h3 className="workspace-card-title">

                {title}

            </h3>

            {description && (

                <p className="workspace-card-description">

                    {description}

                </p>

            )}

        </header>

    );

}