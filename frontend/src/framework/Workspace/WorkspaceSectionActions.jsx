import "./WorkspaceSectionActions.css";

export default function WorkspaceSectionActions({

    actions = [],

}) {

    return (

        <div className="workspace-section-actions">

            {actions.map((action) => (

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

                    title={
                        action.label
                    }

                    aria-label={
                        action.label
                    }

                >

                    {action.icon}

                </button>

            ))}

        </div>

    );

}