import "./WorkspaceSectionActions.css";


const ACTION_DEFINITIONS = {

    edit: {
        label: "Edit",
        icon: "✎",
    },

    clear: {
        label: "Clear",
        icon: "×",
    },

    reset: {
        label: "Reset",
        icon: "↺",
    },

    exit: {
        label: "Exit",
        icon: "→",
    },

    save: {
        label: "Save",
        icon: "✓",
        primary: true,
    },

};


export function WorkspaceSectionActions({

    actions = [],

}) {

    if (!actions.length) {

        return null;

    }


    return (

        <div className="workspace-section-actions">

            {actions.map(actionId => {

                const action =
                    ACTION_DEFINITIONS[actionId];


                if (!action) {

                    return null;

                }


                return (

                    <button

                        key={actionId}

                        type="button"

                        className={

                            action.primary

                                ? "workspace-section-action primary"

                                : "workspace-section-action"

                        }

                    >

                        <span
                            className="
                                workspace-section-action-icon
                            "
                            aria-hidden="true"
                        >

                            {action.icon}

                        </span>


                        <span
                            className="
                                workspace-section-action-label
                            "
                        >

                            {action.label}

                        </span>

                    </button>

                );

            })}

        </div>

    );

}