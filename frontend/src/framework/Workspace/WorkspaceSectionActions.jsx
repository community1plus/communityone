import "./WorkspaceSectionActions.css";


export default function WorkspaceSectionActions({

    actions = [],

}) {

    if (!actions.length) {
        return null;
    }


    return (

        <div className="workspace-section-actions">

            {actions.map(action => (

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
                    onClick={action.onClick}
                    disabled={action.disabled}
                    title={action.label}
                >

                    <span className="workspace-section-action-icon">

                        {action.icon}

                    </span>


                    <span className="workspace-section-action-label">

                        {action.label}

                    </span>

                </button>

            ))}

        </div>

    );

}