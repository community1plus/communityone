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

    } = state;


    const {

        goToSection,

    } = actions;


    const runtime =
        createWorkspaceRuntime({

            sections,

            current:
                currentSection,

        });


    return createWorkspace({

        runtime,

        banner:

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

    });

}