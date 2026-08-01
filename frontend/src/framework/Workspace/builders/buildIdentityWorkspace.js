import { createWorkspace } from "../../../framework/Workspace/builders/createWorkspace";

import { createWorkspaceHeaderModel } from "../../../framework/Workspace/models/WorkspaceHeaderModel";
import { createWorkspaceSectionsModel } from "../../../framework/Workspace/models/WorkspaceSectionsModel";
import { createWorkspaceProgressModel } from "../../../framework/Workspace/models/WorkspaceProgressModel";

export function buildIdentityWorkspace(state, actions) {

    const {
        completion,
        activeSteps,
        currentStep,
    } = state;

    const {
        closeProfile,
        setCurrentStep,
    } = actions;

    //
    // Header Meta
    //

    const meta = createWorkspaceProgressModel({

        value: completion,
        label: "Complete",

    });

    return createWorkspace({

        header: createWorkspaceHeaderModel({

            title: "IDENTITY",

            subtitle: "Your trusted identity.",

            meta,

            onClose: closeProfile,

        }),

        sections: createWorkspaceSectionsModel({

            items: activeSteps,
            current: currentStep,
            onChange: setCurrentStep,

        }),

        progress: createWorkspaceProgressModel({

            value: completion,
            label: `${completion}% Complete`,

        }),

    });

}