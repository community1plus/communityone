import "./WorkspaceSection.css";

import WorkspaceSectionProgress
    from "./WorkspaceSectionProgress";

import {
    WorkspaceSectionActions,
} from "./WorkspaceSectionActions";


export default function WorkspaceSection({
    model,
    children,
}) {

    console.log(
        "🔥 WorkspaceSection MODEL:",
        model
    );

    console.log(
        "🔥 WorkspaceSection ACTIONS:",
        model?.actions
    );

    if (!model?.runtime?.visible) {
        return null;
    }


    if (!model?.runtime?.visible) {
        return null;
    }


    const {

        title = "",

        actions = [],

        runtime = {},

    } = model;


    const completion =
        runtime.completion ?? 0;


    return (

        <section className="workspace-section">


            {/* =====================================
               SECTION HEADER
            ===================================== */}

            <header className="workspace-section-header">


                {/* =================================
                   SECTION HEADING
                ================================= */}

                <div className="workspace-section-heading">


                    <h2 className="workspace-section-title">

                        {title}

                    </h2>


                    <WorkspaceSectionProgress
                        value={completion}
                    />


                </div>


                {/* =================================
                   SECTION ACTIONS
                ================================= */}

                <WorkspaceSectionActions
                    actions={actions}
                />


            </header>


            {/* =====================================
               SECTION BODY
            ===================================== */}

            <div className="workspace-section-body">

                {children}

            </div>


        </section>

    );

}