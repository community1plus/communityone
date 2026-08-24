import {
    useState,
} from "react";


export function WorkspaceSectionActions({

    actions = [],

    handlers = {},

    sectionId,

}) {

    const [
        open,
        setOpen,
    ] = useState(false);


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


        setOpen(false);

    };


    return (

        <div className="workspace-section-actions">


            {/* =====================================
               TRIGGER
            ===================================== */}

            <button

                type="button"

                className="workspace-section-actions-trigger"

                aria-label="Section actions"

                aria-expanded={
                    open
                }

                title="Section actions"

                onClick={() =>
                    setOpen(
                        previous =>
                            !previous
                    )
                }

            >

                ⋮

            </button>


            {/* =====================================
               MENU
            ===================================== */}

            {open && (

                <div
                    className="workspace-section-actions-menu"
                    role="menu"
                >

                    {actions.map(
                        action => (

                            <button

                                key={
                                    action
                                }

                                type="button"

                                role="menuitem"

                                onClick={() =>
                                    handleAction(
                                        action
                                    )
                                }

                            >

                                {action}

                            </button>

                        )
                    )}

                </div>

            )}

        </div>

    );

}