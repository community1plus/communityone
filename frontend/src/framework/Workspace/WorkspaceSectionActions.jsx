import "./WorkspaceSectionActions.css";


export function WorkspaceSectionActions({

    actions = [],

}) {


        console.log("SECTION ACTIONS:", actions);
        
    if (!actions.length) {

        return null;

    }


    return (

        <div className="workspace-section-actions">

            {actions.map(action => (

                <button

                    key={action.id}

                    type="button"

                    className={

                        action.primary

                            ? "workspace-section-action primary"

                            : "workspace-section-action"

                    }

                    disabled={action.disabled}

                    onClick={action.onClick}

                >

                    {action.icon && (

                        <span

                            className="workspace-section-action-icon"

                            aria-hidden="true"

                        >

                            {action.icon}

                        </span>

                    )}


                    <span className="workspace-section-action-label">

                        {action.label}

                    </span>

                </button>

            ))}

        </div>

    );

}