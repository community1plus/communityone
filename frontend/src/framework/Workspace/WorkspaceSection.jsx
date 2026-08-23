import "./WorkspaceSection.css";

import WorkspaceSectionActions from "./WorkspaceSectionActions";


export default function WorkspaceSection({

    model,
    children,

}) {

    if (!model?.runtime?.visible) {

        return null;

    }


    const completion =
        model.runtime?.completion ?? 0;


    return (

        <section className="workspace-section">


            {/* =================================
               SECTION HEADER
            ================================= */}

<header className="workspace-section-header">

    <div className="workspace-section-identity">

        <span className="workspace-section-title">
            {model.title}
        </span>

    </div>


    <div className="workspace-section-controls">

        <div className="workspace-section-completion">

            <div className="workspace-section-progress">

                <div
                    className="workspace-section-progress-fill"
                    style={{
                        width: `${model.runtime?.completion ?? 0}%`,
                    }}
                />

            </div>

            <span className="workspace-section-completion-value">

                {model.runtime?.completion ?? 0}%

            </span>

        </div>


        <WorkspaceSectionActions
            actions={
                model.actions ?? []
            }
        />

    </div>

</header>


            {/* =================================
               SECTION BODY
            ================================= */}

            <div className="workspace-section-body">

                {children}

            </div>


        </section>

    );

}