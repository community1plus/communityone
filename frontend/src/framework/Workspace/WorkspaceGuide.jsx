import "./WorkspaceGuide.css";


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

                    <section

                        key={
                            panel.id
                            ?? panel.key
                            ?? index
                        }

                        className="workspace-panel"
                    >

                        {panel.title && (

                            <h3 className="workspace-panel-title">

                                {panel.title}

                            </h3>

                        )}


                        {panel.content !== undefined && (

                            <div className="workspace-panel-content">

                                {panel.content}

                            </div>

                        )}


                        {panel.value !== undefined && (

                            <div className="workspace-panel-value">

                                {panel.value}

                            </div>

                        )}

                    </section>

                ))}

            </div>

        </section>

    );

}