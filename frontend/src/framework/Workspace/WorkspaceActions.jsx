import "./WorkspaceSectionActions.css";


export default function WorkspaceSectionActions({

    actions = [],

}) {

    if (!Array.isArray(actions) || actions.length === 0) {
        return null;
    }


    return (

        <div className="workspace-section-actions">

            {actions.map(action => {

                if (!action) {
                    return null;
                }


                const {

                    id,

                    label,

                    onClick,

                    disabled = false,

                    primary = false,

                } = action;


                return (

                    <button

                        key={id}

                        type="button"

                        className={
                            primary
                                ? "workspace-section-action workspace-section-action-primary"
                                : "workspace-section-action"
                        }

                        onClick={
                            onClick
                        }

                        disabled={
                            disabled
                        }

                    >

                        {label}

                    </button>

                );

            })}

        </div>

    );

}