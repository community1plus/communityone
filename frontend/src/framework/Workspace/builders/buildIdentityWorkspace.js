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
        label: "Edit",
        icon: "edit",
    },

    clear: {
        label: "Clear",
        icon: "clear",
    },

    reset: {
        label: "Reset",
        icon: "reset",
    },

    exit: {
        label: "Exit",
        icon: "exit",
    },

    save: {
        label: "Save",
        icon: "save",
        primary: true,
    },

};


/* =========================================
   SECTION ACTION VISIBILITY
========================================= */

function getSectionActionVisibility(editing) {

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
   BUILD SECTION ACTIONS
========================================= */

function buildSectionActions({

    section,

    runtime,

    editing,

    saving,

    actions,

}) {

    const visibility =
        getSectionActionVisibility(
            editing
        );


    return (section?.actions ?? [])

        .map((actionId) => {

            const definition =
                SECTION_ACTION_DEFINITIONS[
                    actionId
                ];


            if (!definition) {
                return null;
            }


            const handler = {

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

            }[actionId];


            if (
                !handler ||
                !visibility[actionId]
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

                disabled:
                    actionId === "save"
                        ? saving
                        : false,

                onClick:
                    handler,

            };

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
       SECTION COMPLETION
    ===================================== */

    const currentSectionCompletion =
        section
            ? (
                sectionCompletion?.[
                    section.id
                ] ?? 0
            )
            : 0;


    /* =====================================
       SECTION ACTIONS
    ===================================== */

    const sectionActions =
        buildSectionActions({

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

                runtime: {

                    ...section.runtime,

                    completion:
                        currentSectionCompletion,

                    editing,

                    saving,

                },

                actions:
                    sectionActions,

            }

            : null;


    /* =====================================
       WORKSPACE BANNER
       
       ONLY workspace-level information
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
       SECTION NAVIGATION
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