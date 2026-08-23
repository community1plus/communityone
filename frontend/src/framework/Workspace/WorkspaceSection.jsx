import "./WorkspaceSection.css";

export default function WorkspaceSection({

    model,
    children,

}) {

    if (!model?.runtime?.visible) {

        return null;

    }

    return (

        <section className="workspace-section">

            {/* =================================
               SECTION MENU
            ================================= */}

            <header className="workspace-section-header">

                <div className="workspace-section-identity">

                    <span className="workspace-section-title">
                        {model.title}
                    </span>

                    <span className="workspace-section-completion">
                        [{model.runtime?.completion ?? 0}%]
                    </span>

                </div>


                {/* =================================
                   ACTIONS
                ================================= */}

                <div className="workspace-section-actions">

                    {model.actions?.map((action) => (

                        <button
                            key={action.id}
                            type="button"
                            className={`
                                workspace-section-action
                                ${action.primary
                                    ? "workspace-section-action-primary"
                                    : ""
                                }
                            `}
                            onClick={() =>
                                action.onClick?.()
                            }
                            disabled={
                                Boolean(action.disabled)
                            }
                            title={action.title}
                        >

                            {action.icon}

                            <span>
                                {action.label}
                            </span>

                        </button>

                    ))}

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