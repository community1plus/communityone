import "./WorkspaceSectionActions.css";


export function WorkspaceSectionActions({

    actions = [],

}) {

    if (!actions.length) {

        return null;

    }


    return (

        <div className="workspace-section-actions">


            <span className="workspace-section-actions-label">

                Menu

            </span>


            <div className="workspace-section-actions-list">

                {actions.map(action => (

                    <button

                        key={action.id}

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

                                {action.icon}

                            </span>

                        )}


                        <span>

                            {action.label}

                        </span>

                    </button>

                ))}

            </div>


        </div>

    );

}