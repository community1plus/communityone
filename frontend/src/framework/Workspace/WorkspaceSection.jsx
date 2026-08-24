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

        <div className="workspace-section-title">
            {section.title}
        </div>

        <div className="workspace-section-tools">

            <WorkspaceProgress
                value={
                    section.runtime.completion
                }
            />

            <WorkspaceSectionActions
                actions={
                    section.actions
                }

            />

        </div>

    </header>


    <div className="workspace-section-body">

        {/* existing section renderer */}

    </div>

</section>

    );

}