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
   ACTION DEFINITIONS
========================================= */

const SECTION_ACTION_DEFINITIONS = {

    edit: {

        label:
            "Edit",

    },

    clear: {

        label:
            "Clear",

    },

    reset: {

        label:
            "Reset",

    },

    exit: {

        label:
            "Exit",

    },

    save: {

        label:
            "Save",

        primary:
            true,

    },

};


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


    const sectionId =
        runtime.sectionId;


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
       SECTION ACTION HANDLERS
    ===================================== */

    const sectionActionHandlers = {

        edit: () => {

            if (!sectionId) {
                return;
            }

            actions.setSectionEditing?.(
                sectionId,
                true
            );

        },


        clear: () => {

            if (!sectionId) {
                return;
            }

            actions.clearSection?.(
                sectionId
            );

        },


        reset: () => {

            if (!sectionId) {
                return;
            }

            actions.resetSection?.(
                sectionId
            );

        },


        exit: () => {

            actions.closeProfile?.();

        },


        save: async () => {

            if (!sectionId) {
                return;
            }

            await actions.handleSaveSection?.(
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

                const handler =
                    sectionActionHandlers[
                        actionId
                    ];


                const definition =
                    SECTION_ACTION_DEFINITIONS[
                        actionId
                    ];


                if (
                    !handler ||
                    !definition
                ) {

                    return null;

                }


                /* =============================
                   VISIBILITY
                ============================= */

                const visible =

                    actionId === "edit"

                        ? !editing

                        : (
                            actionId === "clear" ||
                            actionId === "reset" ||
                            actionId === "save"
                        )

                            ? editing

                            : true;


                if (!visible) {

                    return null;

                }


                /* =============================
                   ACTION
                ============================= */

                return {

                    id:
                        actionId,

                    label:
                        definition.label,

                    primary:
                        definition.primary ?? false,

                    onClick:
                        handler,

                    disabled:

                        actionId === "save"

                            ? saving

                            : false,

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