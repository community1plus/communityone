import { createWorkspace } from "../../../framework/Workspace/builders/createWorkspace";

import { createWorkspaceHeaderModel } from "../../../framework/Workspace/models/WorkspaceHeaderModel";
import { createWorkspaceNavigationModel } from "../../../framework/Workspace/models/WorkspaceNavigationModel";
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

    return createWorkspace({

        header: createWorkspaceHeaderModel({

            title: "IDENTITY",
            subtitle: "Your trusted identity.",
            onClose: closeProfile,

        }),

        navigation: createWorkspaceNavigationModel({

            items: activeSteps,

            current: currentStep,

            onChange: setCurrentStep,

        }),

        progress: createWorkspaceProgressModel({

            value: completion,

            label: "",

        }),

    });

}