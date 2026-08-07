import { createWorkspace } from "../../../framework/Workspace/builders/createWorkspace";

import { createWorkspaceHeaderModel } from "../../../framework/Workspace/models/WorkspaceHeaderModel";
import { createWorkspaceProgressModel } from "../../../framework/Workspace/models/WorkspaceProgressModel";
import { createWorkspaceSectionsModel } from "../models/WorkspaceNavigationModel";

export function buildWalletWorkspace({

    currentSection,

    setCurrentSection,

    navigation,

}) {

    return createWorkspace({

        header: createWorkspaceHeaderModel({

            title: "WALLET",

            subtitle: "Your financial identity.",

        }),

        navigation: createWorkspaceSectionsModel({

            items: navigation,

            current: currentSection,

            onChange: setCurrentSection,

        }),

        progress: createWorkspaceProgressModel({

            value: 0,

            label: "Ready",

        }),

    });

}