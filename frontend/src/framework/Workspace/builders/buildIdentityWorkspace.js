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

        });


    /* =====================================
       CURRENT SECTION
    ===================================== */

    const sectionId =
        runtime.sectionId;

    const editing =
        sectionId
            ? Boolean(
                editingSections?.[sectionId]
            )
            : false;

    const saving =
        Boolean(
            savingSection
        );


    /* =====================================
       SECTION ACTION HANDLERS
    ===================================== */

    const sectionActionHandlers = {

        edit: () => {

            if (!sectionId) {
                return;
            }

            actions.setSectionEditing(
                sectionId,
                true
            );

        },


        clear: () => {

            if (!sectionId) {
                return;
            }

            actions.clearSection(
                sectionId
            );

        },


        reset: () => {

            if (!sectionId) {
                return;
            }

            actions.resetSection(
                sectionId
            );

        },


        save: async () => {

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
        (runtime.section?.actions ?? [])
            .map((actionId) => {

                const handler =
                    sectionActionHandlers[
                        actionId
                    ];

                if (!handler) {
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

                    visible:

                        actionId === "edit"
                            ? !editing

                            : actionId === "clear"
                            || actionId === "reset"
                            || actionId === "save"
                                ? editing

                                : true,

                };

            })
            .filter(Boolean)
            .filter(
                action =>
                    action.visible
            );


    /* =====================================
       SECTION
    ===================================== */

    const section = {

        ...runtime.section,

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

            section,

        },

    });

}