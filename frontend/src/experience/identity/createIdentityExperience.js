import { createExperience }
from "../../framework/Experience";

import { Workspace }
from "../../framework/Workspace";

export function createIdentityExperience({

    completion,

    activeSteps,

    currentStep,

    editMode,

    closeProfile,

    setCurrentStep,

}) {

    return createExperience({

        workspace: {

            header: Workspace.Header({

                title: "PROFILE",

                subtitle: "Your trusted identity.",

                onClose: editMode
                    ? closeProfile
                    : undefined,

            }),

            navigation: Workspace.Navigation({

                items: activeSteps,

                current: currentStep,

                onChange: setCurrentStep,

            }),

            progress: Workspace.Progress({

                value: completion,


            }),

        },

    });

}