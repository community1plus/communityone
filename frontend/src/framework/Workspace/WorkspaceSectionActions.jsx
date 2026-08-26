import "./WorkspaceSectionActions.css";


export function WorkspaceSectionActions({
    actions = [],
}) {

    console.log(
        "🔥 ACTIONS COMPONENT:",
        actions
    );

    if (!Array.isArray(actions) || !actions.length) {
        console.log("❌ NO ACTIONS TO RENDER");
        return null;
    }

    return (
        <div className="workspace-section-actions">

            {actions.map((action) => {

                console.log(
                    "🔘 RENDER ACTION:",
                    action
                );

                if (!action?.id) {
                    return null;
                }

                return (
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
                );
            })}

        </div>
    );
}