import "./WorkspaceSectionActions.css";


export function WorkspaceSectionActions({

    actions = [],

}) {

    if (!actions.length) {
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

                    icon,

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

                        onClick={onClick}

                        disabled={disabled}

                        title={label}

                    >

                        {icon && (

                            <span className="workspace-section-action-icon">

                                {icon}

                            </span>

                        )}

                        <span>

                            {label}

                        </span>

                    </button>

                );

            })}


        </div>

    );

}