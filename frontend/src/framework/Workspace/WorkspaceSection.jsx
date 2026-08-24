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


    const actions =
        model.actions ?? [];


    return (

        <section className="workspace-section">

            <header className="workspace-section-header">

                <div className="workspace-section-heading">

                    <h2 className="workspace-section-title">
                        {model.title}
                    </h2>

                </div>


                <div className="workspace-section-tools">

                    <WorkspaceSectionProgress
                        value={completion}
                    />


                    <WorkspaceSectionActions
                        actions={actions}
                    />

                </div>

            </header>


            <div className="workspace-section-body">

                {children}

            </div>

        </section>

    );

}