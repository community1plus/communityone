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


import {
    WORKSPACE_SECTION_ACTIONS,
} from "../../../framework/Workspace/models/WorkspaceSectionModel";


/* =========================================
   SECTION ACTION DEFINITIONS
========================================= */

const SECTION_ACTION_DEFINITIONS = {

    [WORKSPACE_SECTION_ACTIONS.EDIT]: {

        label:
            "Edit",

        icon:
            "✎",

    },


    [WORKSPACE_SECTION_ACTIONS.CLEAR]: {

        label:
            "Clear",

        icon:
            "□",

    },


    [WORKSPACE_SECTION_ACTIONS.RESET]: {

        label:
            "Reset",

        icon:
            "↻",

    },


    [WORKSPACE_SECTION_ACTIONS.EXIT]: {

        label:
            "Exit",

        icon:
            "×",

    },


    [WORKSPACE_SECTION_ACTIONS.SAVE]: {

        label:
            "Save",

        icon:
            "✓",

        primary:
            true,

    },

};


/* =========================================
   ACTION VISIBILITY
========================================= */

function isSectionActionVisible(

    actionId,

    editing

) {

    switch (actionId) {

        case WORKSPACE_SECTION_ACTIONS.EDIT:

            return !editing;


        case WORKSPACE_SECTION_ACTIONS.CLEAR:

            return editing;


        case WORKSPACE_SECTION_ACTIONS.RESET:

            return editing;


        case WORKSPACE_SECTION_ACTIONS.EXIT:

            return true;


        case WORKSPACE_SECTION_ACTIONS.SAVE:

            return editing;


        default:

            return false;

    }

}


/* =========================================
   ACTION DISABLED STATE
========================================= */

function isSectionActionDisabled(

    actionId,

    saving

) {

    switch (actionId) {

        case WORKSPACE_SECTION_ACTIONS.SAVE:

            return saving;


        default:

            return false;

    }

}


/* =========================================
   WORKSPACE BUILDER
========================================= */

export function buildIdentityWorkspace(

    state,

    actions

) {


    /* =====================================
       STATE
    ===================================== */

    const {

        completion,

        sections,

        currentSection,

        values,

        sectionCompletion,

        editingSections,

        savingSection,

    } = state;


    /* =====================================
       NAVIGATION ACTION
    ===================================== */

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


    const sectionId =
        runtime.sectionId;


    /* =====================================
       SECTION RUNTIME STATE
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
       SECTION ACTION HANDLERS
    ===================================== */

    const sectionActionHandlers = {

        [WORKSPACE_SECTION_ACTIONS.EDIT]:

            () => {

                if (!sectionId) {
                    return;
                }

                actions.setSectionEditing(
                    sectionId,
                    true
                );

            },


        [WORKSPACE_SECTION_ACTIONS.CLEAR]:

            () => {

                if (!sectionId) {
                    return;
                }

                actions.clearSection(
                    sectionId
                );

            },


        [WORKSPACE_SECTION_ACTIONS.RESET]:

            () => {

                if (!sectionId) {
                    return;
                }

                actions.resetSection(
                    sectionId
                );

            },


        [WORKSPACE_SECTION_ACTIONS.EXIT]:

            () => {

                actions.closeProfile();

            },


        [WORKSPACE_SECTION_ACTIONS.SAVE]:

            async () => {

                if (!sectionId) {
                    return;
                }

                await actions.handleSaveSection(
                    sectionId
                );

            },

    };


    /* =====================================
       SECTION ACTION MODEL
    ===================================== */

    const sectionActions =

        (section?.actions ?? [])

            .map((actionId) => {

                const definition =
                    SECTION_ACTION_DEFINITIONS[
                        actionId
                    ];


                const handler =
                    sectionActionHandlers[
                        actionId
                    ];


                if (
                    !definition ||
                    !handler
                ) {

                    return null;

                }


                const visible =
                    isSectionActionVisible(
                        actionId,
                        editing
                    );


                if (!visible) {
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
                        isSectionActionDisabled(
                            actionId,
                            saving
                        ),

                };

            })

            .filter(Boolean);


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
       WORKSPACE BANNER
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