import "./WorkspaceSectionHeader.css";

export default function WorkspaceSectionHeader({

    title,
    description,

}) {

    return (

        <div className="workspace-section-header">

            <h2 className="workspace-section-title">

                {title}

            </h2>

            {description && (

                <p className="workspace-section-description">

                    {description}

                </p>

            )}

        </div>

    );

}