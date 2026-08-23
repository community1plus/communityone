import "./WorkspaceSectionActions.css";


const ACTIONS = {

    edit: {
        label: "Edit",
        icon: "✎",
    },

    clear: {
        label: "Clear",
        icon: "⌫",
    },

    reset: {
        label: "Reset",
        icon: "↻",
    },

    exit: {
        label: "Exit",
        icon: "×",
    },

    save: {
        label: "Save",
        icon: "✓",
    },

};


export default function WorkspaceSectionActions({

    actions = [],

}) {

    if (!actions.length) {

        return null;

    }


    return (

        <div className="workspace-section-actions">

            {actions.map((action) => {

                const definition =
                    ACTIONS[action.id];

                if (!definition) {
                    return null;
                }


                return (

                    <button
                        key={action.id}
                        type="button"
                        className="
                            workspace-section-action
                        "
                        onClick={
                            action.onClick
                        }
                        disabled={
                            Boolean(
                                action.disabled
                            )
                        }
                        title={
                            definition.label
                        }
                    >

                        <span
                            className="
                                workspace-section-action-icon
                            "
                        >
                            {definition.icon}
                        </span>

                        <span
                            className="
                                workspace-section-action-label
                            "
                        >
                            {definition.label}
                        </span>

                    </button>

                );

            })}

        </div>

    );

}