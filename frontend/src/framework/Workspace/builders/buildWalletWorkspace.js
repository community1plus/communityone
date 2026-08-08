import { createWorkspace } from "../../../framework/Workspace/builders/createWorkspace";

import { createWorkspaceHeaderModel } from "../../../framework/Workspace/models/WorkspaceHeaderModel";
import { createWorkspaceProgressModel } from "../../../framework/Workspace/models/WorkspaceProgressModel";
import { createWorkspaceNavigationModel } from "../models/WorkspaceNavigationModel";

export function buildWalletWorkspace({

    currentSection,

    gotToSection,

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

            onChange: goToSection,

        }),

        progress: createWorkspaceProgressModel({

            value: 0,

            label: "Ready",

        }),

    });

}