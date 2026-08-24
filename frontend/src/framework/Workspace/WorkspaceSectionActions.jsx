import "./WorkspaceSectionActions.css";


export function WorkspaceSectionActions({

    actions = [],

}) {

    if (!actions.length) {

        return null;

    }


    return (

        <div className="workspace-section-actions">


            {/* =====================================
               MENU TRIGGER
            ===================================== */}

            <button

                type="button"

                className="
                    workspace-section-actions-trigger
                "

                aria-label="Section actions"

                title="Section actions"

            >

                ⋮

            </button>


            {/* =====================================
               MENU
            ===================================== */}

            <div
                className="
                    workspace-section-actions-menu
                "
            >

                {actions.map(action => (

                    <button

                        key={
                            action.id
                        }

                        type="button"

                        className={

                            action.primary

                                ? "workspace-section-action primary"

                                : "workspace-section-action"

                        }

                        disabled={
                            action.disabled
                        }

                        onClick={
                            action.onClick
                        }

                    >

                        {action.icon && (

                            <span
                                className="
                                    workspace-section-action-icon
                                "
                                aria-hidden="true"
                            >

                                {
                                    action.icon
                                }

                            </span>

                        )}


                        <span>

                            {
                                action.label
                            }

                        </span>

                    </button>

                ))}

            </div>


        </div>

    );

}