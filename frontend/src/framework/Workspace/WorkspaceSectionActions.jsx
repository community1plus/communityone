import "./WorkspaceSectionActions.css";


export function WorkspaceSectionActions({

    actions = [],

}) {

    if (!actions.length) {

        return null;

    }


    return (

        <div className="workspace-section-actions">

            {actions.map(action => (

                <button

                    key={action}

                    type="button"

                    className="workspace-section-action"

                >

                    {action}

                </button>

            ))}

        </div>

    );

}