export function WorkspaceSectionActions({

    actions = [],

    handlers = {},

    sectionId,

}) {

    if (!actions.length) {
        return null;
    }


    const {

        setSectionEditing,

        handleSaveSection,

        clearSection,

        resetSection,

        closeProfile,

    } = handlers;


    const handleAction = (action) => {

        switch (action) {

            case "edit":

                setSectionEditing?.(
                    sectionId,
                    true
                );

                break;


            case "clear":

                clearSection?.(
                    sectionId
                );

                break;


            case "reset":

                resetSection?.(
                    sectionId
                );

                break;


            case "exit":

                closeProfile?.();

                break;


            case "save":

                handleSaveSection?.(
                    sectionId
                );

                break;


            default:

                break;

        }

    };


    return (

        <div className="workspace-section-actions">

            <button
                type="button"
                className="workspace-section-actions-trigger"
                aria-label="Section actions"
                title="Section actions"
            >
                ⋮
            </button>


            <div className="workspace-section-actions-menu">

                {actions.map(action => (

                    <button

                        key={action}

                        type="button"

                        onClick={() =>
                            handleAction(action)
                        }

                    >

                        {action}

                    </button>

                ))}

            </div>

        </div>

    );

}