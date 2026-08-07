import { createWorkspace } from "../../../framework/Workspace/builders/createWorkspace";

import { createWorkspaceHeaderModel } from "../../../framework/Workspace/models/WorkspaceHeaderModel";
import { createWorkspaceNavigationModel } from "../../../framework/Workspace/models/WorkspaceNavigationModel";
import { createWorkspaceProgressModel } from "../../../framework/Workspace/models/WorkspaceProgressModel";
import { createWorkspaceBannerModel } from "../../../framework/Workspace/models/WorkspaceBannerModel";

export function buildIdentityWorkspace(state, actions) {

    const {

        completion,
        sections,
        currentSection,

    } = state;

    const {

        closeProfile,
        setCurrentSection,

    } = actions;

    return createWorkspace({

banner: createWorkspaceBannerModel({

    left: {

        title: "IDENTITY",

    },

    centre: {

        mode: "identity",

    },

    right: {

        metric: createWorkspaceProgressModel({

            value: completion,

        }),

    },

}),

        navigation: createWorkspaceNavigationModel({

            items: sections,

            current: currentSection,

            onChange: setCurrentSection,

        }),



    });

}