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


/* ==========================================================
   SECTION ACTION DEFINITIONS
   ========================================================== */

const SECTION_ACTION_DEFINITIONS = {

    edit: {
        label: "Edit",
        icon: "✎",
    },

    clear: {
        label: "Clear",
        icon: "□",
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
        primary: true,
    },

};


/* ==========================================================
   WORKSPACE BUILDER
   ========================================================== */

export function buildIdentityWorkspace(

    state,

    actions

) {


    /* ======================================================
       STATE
       ====================================================== */

    const {

        completion,

        sections,

        currentSection,

        values,

        sectionCompletion,

        editingSections,

        savingSection,

    } = state;


    /* ======================================================
       ACTIONS
       ====================================================== */

    const {

        goToSection,

    } = actions;


    /* ======================================================
       RUNTIME
       ====================================================== */

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


    /* ======================================================
       CURRENT SECTION
       ====================================================== */

    const section =
        runtime.section;


    /* ======================================================
       BANNER
       ====================================================== */

    const banner =
        createWorkspaceBannerModel({

            left: {

                title:
                    "PROFILE",

            },

            center: {

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


    /* ======================================================
       NAVIGATION
       ====================================================== */

    const navigation =
        createWorkspaceNavigationModel({

            items:
                runtime.sections,

            current:
                runtime.current,

            onChange:
                goToSection,

        });


    /* ======================================================
       GUIDE
       ====================================================== */

    const guide = {

        title:
            "IDENTITY GUIDE",

        panels: [

            {

                id:
                    "welcome",

                title:
                    "Welcome",

                content:
                    "Manage your trusted identity.",

            },

        ],

    };


    /* ======================================================
       NO CURRENT SECTION
       ====================================================== */

    if (!section) {

        return createWorkspace({

            runtime,

            banner,

            navigation,

            guide,

            body: {

                section:
                    null,

            },

        });

    }


    /* ======================================================
       SECTION STATE
       ====================================================== */

    const saving =
        Boolean(
            section.runtime?.saving
        );


    const sectionId =
        section.id;


    /* ======================================================
       SECTION ACTION HANDLERS
       ====================================================== */

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


    /* ======================================================
       ACTION VISIBILITY
       
       All configured section actions are permanently
       available. Runtime state controls disabled state,
       not whether the action exists.
       ====================================================== */

    const isActionVisible = {

        edit:
            true,

        clear:
            true,

        reset:
            true,

        exit:
            true,

        save:
            true,

    };


    /* ======================================================
       RESOLVE SECTION ACTIONS
       ====================================================== */

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


                /*
                 * Ignore unknown or unsupported actions.
                 */

                if (

                    !definition ||

                    !handler

                ) {

                    return null;

                }


                /*
                 * All known actions are visible.
                 */

                if (

                    !isActionVisible[
                        actionId
                    ]

                ) {

                    return null;

                }


                /*
                 * Resolve the action ID into the
                 * renderable WorkspaceSectionAction model.
                 */

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


    /* ======================================================
       RESOLVED SECTION
       ====================================================== */

    const resolvedSection = {

        ...section,

        actions:
            sectionActions,

    };


    /* ======================================================
       WORKSPACE
       ====================================================== */

    return createWorkspace({

        runtime,

        banner,

        navigation,

        guide,

        body: {

            section:
                resolvedSection,

        },

    });

}