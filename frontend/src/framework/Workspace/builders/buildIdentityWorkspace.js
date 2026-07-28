import { Workspace } from "../../../framework/Workspace";

export function buildIdentityWorkspace(state, actions) {

    const {
        completion,
        activeSteps,
        currentStep,
        editMode,
    } = state;

    const {
        closeProfile,
        setCurrentStep,
    } = actions;

    return Workspace.create({

        header: Workspace.Header({

            title: "IDENTITY",
            subtitle: "Your trusted identity.",
            onClose: editMode
                ? closeProfile
                : undefined,

        }),

        sections: Workspace.Sections({

            items: activeSteps,
            current: currentStep,
            onChange: setCurrentStep,

        }),

        progress: Workspace.Progress({

            value: completion,
            label: `${completion}% Complete`,

        }),

    });

}