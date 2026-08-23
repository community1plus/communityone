import {
    createWorkspace,
} from "../../../framework/Workspace/builders/createWorkspace";

import {
    createWorkspaceNavigationModel,
} from "../../../framework/Workspace/models/WorkspaceNavigationModel";

import {
    createWorkspaceProgressModel,
} from "../../../framework/Workspace/models/WorkspaceProgressModel";

import {
    createWorkspaceBannerModel,
} from "../../../framework/Workspace/models/WorkspaceBannerModel";

import {
    createWorkspaceRuntime,
} from "../../../framework/Workspace/runtime/WorkspaceRuntime";


/* =========================================
   SECTION ACTION DEFINITIONS
========================================= */

const SECTION_ACTION_DEFINITIONS = {

    edit: {

        label:
            "Edit",

        icon:
            "✎",

    },


    clear: {

        label:
            "Clear",

        icon:
            "□",

    },


    reset: {

        label:
            "Reset",

        icon:
            "↻",

    },


    exit: {

        label:
            "Exit",

        icon:
            "×",

    },


    save: {

        label:
            "Save",

        icon:
            "✓",

        primary:
            true,

    },

};


/* =========================================
   SECTION ACTION VISIBILITY
========================================= */

function getSectionActionVisibility(
    editing
) {

    return {

        edit:
            !editing,

        clear:
            editing,

        reset:
            editing,

        exit:
            true,

        save:
            editing,

    };

}


/* =========================================
   SECTION ACTION HANDLERS
========================================= */

function createSectionActionHandlers({

    runtime,

    actions,

}) {

    return {

        edit: () => {

            if (!runtime.sectionId) {
                return;
            }

            actions.setSectionEditing(

                runtime.sectionId,

                true

            );

        },


        clear: () => {

            if (!runtime.sectionId) {
                return;
            }

            actions.clearSection(

                runtime.sectionId

            );

        },


        reset: () => {

            if (!runtime.sectionId) {
                return;
            }

            actions.resetSection(

                runtime.sectionId

            );

        },


        exit: () => {

            actions.closeProfile();

        },


        save: async () => {

            if (!runtime.sectionId) {
                return;
            }

            await actions.handleSaveSection(

                runtime.sectionId

            );

        },

    };

}


/* =========================================
   SECTION ACTION MODEL
========================================= */

function createSectionActionModel({

    actionId,

    handler,

    definition,

    visible,

    saving,

}) {

    if (
        !handler ||
        !definition ||
        !visible
    ) {

        return null;

    }


    return {

        id:
            actionId,

        label:
            definition.label,

        icon:
            definition.icon,

        primary:
            definition.primary ?? false,

        onClick:
            handler,

        disabled:

            actionId === "save"

                ? saving

                : false,

    };

}


/* =========================================
   RESOLVE SECTION ACTIONS
========================================= */

function resolveSectionActions({

    section,

    runtime,

    editing,

    saving,

    actions,

}) {

    if (!section) {
        return [];
    }


    const handlers =
        createSectionActionHandlers({

            runtime,

            actions,

        });


    const visibility =
        getSectionActionVisibility(

            editing

        );


    return (

        section.actions ?? []

    )

        .map((actionId) => {

            const definition =
                SECTION_ACTION_DEFINITIONS[
                    actionId
                ];


            const handler =
                handlers[
                    actionId
                ];


            return createSectionActionModel({

                actionId,

                handler,

                definition,

                visible:
                    visibility[actionId],

                saving,

            });

        })

        .filter(Boolean);

}


/* =========================================
   WORKSPACE BUILDER
========================================= */

export function buildIdentityWorkspace(

    state,

    actions

) {

    const {

        completion,

        sections,

        currentSection,

        values,

        sectionCompletion,

        editingSections,

        savingSection,

    } = state;


    const {

        goToSection,

    } = actions;


    /* =====================================
       RUNTIME
    ===================================== */

    const runtime =
        createWorkspaceRuntime({

            sections,

            current:
                currentSection,

            values,

            sectionCompletion,

            editingSections,

            savingSection,

        });


    /* =====================================
       CURRENT SECTION
    ===================================== */

    const section =
        runtime.section;


    /* =====================================
       SECTION STATE
    ===================================== */

    const editing =
        Boolean(

            section?.runtime?.editing

        );


    const saving =
        Boolean(

            section?.runtime?.saving

        );


    /* =====================================
       SECTION ACTIONS
    ===================================== */

    const sectionActions =
        resolveSectionActions({

            section,

            runtime,

            editing,

            saving,

            actions,

        });


    /* =====================================
       RESOLVED SECTION
    ===================================== */

    const resolvedSection =

        section

            ? {

                ...section,

                actions:
                    sectionActions,

            }

            : null;


    /* =====================================
       BANNER
    ===================================== */

    const banner =
        createWorkspaceBannerModel({

            left: {

                title:
                    "IDENTITY",

            },

            centre: {

                mode:
                    "identity",

            },

            right: {

                metric:

                    createWorkspaceProgressModel({

                        value:
                            completion,

                    }),

            },

        });


    /* =====================================
       NAVIGATION
    ===================================== */

    const navigation =
        createWorkspaceNavigationModel({

            items:
                runtime.sections,

            current:
                runtime.current,

            onChange:
                goToSection,

        });


    /* =====================================
       WORKSPACE
    ===================================== */

    return createWorkspace({

        runtime,

        banner,

        navigation,

        body: {

            section:
                resolvedSection,

        },

    });

}