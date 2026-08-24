import "./WorkspaceSectionActions.css";


export default function WorkspaceSectionActions({

    actions = [],

}) {

    if (
        !Array.isArray(actions) ||
        actions.length === 0
    ) {
        return null;
    }


    return (

        <details className="workspace-section-actions">

            <summary
                className="workspace-section-actions-trigger"
                aria-label="Section actions"
            >
                ⋮
            </summary>


            <div className="workspace-section-actions-menu">

                {actions.map(action => {

                    if (!action) {
                        return null;
                    }


                    return (

                        <button

                            key={action.id}

                            type="button"

                            className={`
                                workspace-section-action
                                ${
                                    action.primary
                                        ? "workspace-section-action-primary"
                                        : ""
                                }
                            `}

                            onClick={
                                action.onClick
                            }

                            disabled={
                                Boolean(
                                    action.disabled
                                )
                            }

                        >

                            {action.icon && (

                                <span
                                    className="workspace-section-action-icon"
                                >
                                    {action.icon}
                                </span>

                            )}

                            <span>

                                {action.label}

                            </span>

                        </button>

                    );

                })}

            </div>

        </details>

    );

}