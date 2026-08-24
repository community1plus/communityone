import "./WorkspaceSection.css";

import WorkspaceSectionProgress
    from "./WorkspaceSectionProgress";

import WorkspaceSectionActions
    from "./WorkspaceSectionActions";


export default function WorkspaceSection({

    model,

    children,

}) {

    /* =====================================
       VISIBILITY
    ===================================== */

    if (!model?.runtime?.visible) {

        return null;

    }


    /* =====================================
       SECTION STATE
    ===================================== */

    const completion =
        model.runtime?.completion ?? 0;


    const actions =
        model.actions ?? [];


    /* =====================================
       RENDER
    ===================================== */

    return (

        <section
            className="workspace-section"
        >

            {/* =================================
                SECTION HEADER
            ================================= */}

            <header
                className="workspace-section-header"
            >

                <div
                    className="workspace-section-title"
                >

                    {model.title}

                </div>


                <div
                    className="workspace-section-tools"
                >

                    <WorkspaceSectionProgress
                        value={
                            completion
                        }
                    />


                    <WorkspaceSectionActions
                        actions={
                            actions
                        }

                    />

                </div>

            </header>


            {/* =================================
                SECTION BODY
            ================================= */}

            <div
                className="workspace-section-body"
            >

                {children}

            </div>

        </section>

    );

}