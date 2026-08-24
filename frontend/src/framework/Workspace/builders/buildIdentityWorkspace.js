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


    if (!section) {

        return createWorkspace({

            runtime,

            banner:
                createWorkspaceBannerModel({

                    left: {

                        title:
                            "PROFILE",

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

                }),

            navigation:

                createWorkspaceNavigationModel({

                    items:
                        runtime.sections,

                    current:
                        runtime.current,

                    onChange:
                        goToSection,

                }),

            body: {

                section:
                    null,

            },

        });

    }


    /* =====================================
       SECTION STATE
    ===================================== */

    const editing =
        Boolean(
            section.runtime?.editing
        );


    const saving =
        Boolean(
            section.runtime?.saving
        );


    const sectionId =
        section.id;


    /* =====================================
       SECTION ACTION HANDLERS
    ===================================== */

    const sectionActionHandlers = {

        edit: () => {

            actions.setSectionEditing(
                sectionId,
                true
            );

        },


        clear: () => {

            actions.clearSection(
                sectionId
            );

        },


        reset: () => {

            actions.resetSection(
                sectionId
            );

        },


        exit: () => {

            actions.closeProfile();

        },


        save: async () => {

            await actions.handleSaveSection(
                sectionId
            );

        },

    };


    /* =====================================
       ACTION VISIBILITY
    ===================================== */

    const isActionVisible = {

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


    /* =====================================
       RESOLVE SECTION ACTIONS
    ===================================== */

    const sectionActions =

        (section.actions ?? [])

            .map(actionId => {

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


                if (
                    !isActionVisible[
                        actionId
                    ]
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
                        definition.primary
                            ?? false,

                    disabled:
                        actionId === "save"
                            ? saving
                            : false,

                    onClick:
                        handler,

                };

            })

            .filter(Boolean);


    /* =====================================
       RESOLVED SECTION
    ===================================== */

    const resolvedSection = {

        ...section,

        actions:
            sectionActions,

    };


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