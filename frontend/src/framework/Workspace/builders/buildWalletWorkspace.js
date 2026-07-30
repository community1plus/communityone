import { createWorkspace } from "../../../framework/Workspace/builders/createWorkspace";

import { createWorkspaceHeaderModel } from "../../../framework/Workspace/models/WorkspaceHeaderModel";
import { createWorkspaceProgressModel } from "../../../framework/Workspace/models/WorkspaceProgressModel";
import { createWorkspaceSectionsModel } from "../../../framework/Workspace/models/WorkspaceSectionsModel";

export default function buildWalletWorkspace({

    currentSection,

    setCurrentSection,

    sections,

}) {

    return createWorkspace({

        header: createWorkspaceHeaderModel({

            title: "WALLET",

            subtitle: "Your financial identity.",

        }),

        sections: createWorkspaceSectionsModel({

            items: sections,

            current: currentSection,

            onChange: setCurrentSection,

        }),

        progress: createWorkspaceProgressModel({

            value: 0,

            label: "Ready",

        }),

    });

}