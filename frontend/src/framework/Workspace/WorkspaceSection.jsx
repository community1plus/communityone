import "./WorkspaceSection.css";

import WorkspaceSectionProgress
    from "./WorkspaceSectionProgress";

import {
    WorkspaceSectionActions,
} from "./WorkspaceSectionActions";


export default function WorkspaceSection({

    model,

    children,

    actionHandlers = {},

}) {

    if (!model?.runtime?.visible) {
        return null;
    }


    const {

        id,

        title = "",

        actions = [],

        runtime = {},

    } = model;


    const completion =
        runtime.completion ?? 0;


    return (

        <section className="workspace-section">


            {/* =====================================
               SECTION ACTION BAR
            ===================================== */}

            <header className="workspace-section-header">


                <div className="workspace-section-heading">

                    <h2 className="workspace-section-title">

                        {title}

                    </h2>

                </div>


                <div className="workspace-section-tools">


                    <WorkspaceSectionProgress
                        value={completion}
                    />


                    <WorkspaceSectionActions

                        actions={
                            actions
                        }

                        handlers={
                            actionHandlers
                        }

                        sectionId={
                            id
                        }

                    />


                </div>


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