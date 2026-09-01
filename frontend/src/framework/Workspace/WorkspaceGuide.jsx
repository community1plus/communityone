import "./WorkspaceGuide.css";
import WorkspacePanel from "./WorkspacePanel";

export default function WorkspaceGuide({

    model = {},

}) {

    const {

        title = "",
        panels = [],

    } = model;


    return (

        <section className="workspace-guide">


            {/* ==================================================
               GUIDE HEADER
               ================================================== */}

            <header className="workspace-guide-header">

                <h2 className="workspace-guide-title">

                    {title}

                </h2>

            </header>


            {/* ==================================================
               GUIDE BODY
               ================================================== */}

            <div className="workspace-guide-body">

                {panels.map((panel, index) => (

                    <WorkspacePanel

                        key={
                            panel.id
                            ?? panel.key
                            ?? index
                        }

                        title={
                            panel.title
                        }

                        content={
                            panel.content
                        }

                        value={
                            panel.value
                        }

                    />

                ))}

            </div>


        </section>

    );

}