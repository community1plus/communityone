import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceSidebar,
    WorkspaceRegionHeader,
    WorkspaceHeader,
    WorkspaceWorkflow,
    WorkspaceTabs,
    WorkspaceProgress,
    WorkspaceBody,
    WorkspaceGuide,
    WorkspaceActions,
} from "../../framework/Workspace";

import CapabilitySelector from "./components/CapabilitySelector";
import CapabilitySectionRenderer from "./sections/CapabilitySectionRenderer";
import CapabilityGuide from "../../components/Capability/CapabilityGuide";
import CapabilityActions from "../../components/Capability/CapabilityActions";
import GuideProgress from "../../components/Guide/GuideCardProgress";

export default function CapabilityWorkspace({

    state,
    actions,

}) {

    const {

        activeSteps,
        currentStep,
        completion,
        sectionId,

    } = state;

    const {

        setCurrentStep,

    } = actions;

    return (

        <WorkspaceShell>

            <WorkspaceMain>

                <WorkspaceRegionHeader>

                    <WorkspaceHeader
                        title="CAPABILITIES"
                        subtitle="Configure what this Entity can do."
                    />

                </WorkspaceRegionHeader>

                <WorkspaceWorkflow>

                    <CapabilitySelector />

                    <WorkspaceTabs
                        steps={activeSteps}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                    />

                </WorkspaceWorkflow>

                <WorkspaceProgress
                    value={completion}
                    label={`${completion}% Complete`}
                />

                <WorkspaceBody>

                    <CapabilitySectionRenderer
                        sectionId={sectionId}
                        state={state}
                        actions={actions}
                    />

                </WorkspaceBody>

            </WorkspaceMain>

            <WorkspaceSidebar>

<WorkspaceGuide>

    <GuideProgress />

</WorkspaceGuide>

                <WorkspaceActions>

                    <CapabilityActions
                        state={state}
                        actions={actions}
                    />

                </WorkspaceActions>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}