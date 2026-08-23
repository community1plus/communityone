import "./WorkspaceSection.css";

import WorkspaceSectionProgress
    from "./WorkspaceSectionProgress";

import WorkspaceSectionActions
    from "./WorkspaceSectionActions";


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

            <header className="workspace-section-header">

                <div className="workspace-section-identity">

                    <span className="workspace-section-title">
                        {model.title}
                    </span>

                </div>


                <div className="workspace-section-controls">

                    <WorkspaceSectionProgress

                        value={
                            completion
                        }

                    />


                    <WorkspaceSectionActions

                        actions={
                            model.actions
                        }

                    />

                </div>

            </header>


            <div className="workspace-section-body">

                {children}

            </div>

        </section>

    );

}