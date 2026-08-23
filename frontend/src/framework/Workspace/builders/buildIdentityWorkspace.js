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
       SECTION ACTION STATE
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


        save: async () => {

            if (!runtime.sectionId) {
                return;
            }

            await actions.handleSaveSection(
                runtime.sectionId
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


                if (!handler) {
                    return null;
                }


                const visible =

                    actionId === "edit"

                        ? !editing

                        : actionId === "clear"
                        || actionId === "reset"
                        || actionId === "save"

                            ? editing

                            : true;


                if (!visible) {
                    return null;
                }


                return {

                    id:
                        actionId,

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
       SECTION MODEL
    ===================================== */

    const resolvedSection = section

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