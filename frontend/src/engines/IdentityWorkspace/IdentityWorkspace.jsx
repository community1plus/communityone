import CapabilityRenderer from "../../components/Capability/CapabilityRenderer";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";
import ProfileCapabilitySelector from "../../components/Profile/IdentityCapabilitySelector";
import { buildCapabilityWorkspace } from "../../framework/Workspace/builders/buildCapabilityWorkspace";

import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceSidebar,
    WorkspaceRegionHeader,
    WorkspaceHeader,
    WorkspaceWorkflow,
    WorkspaceTabs,
    WorkspaceCompletion,
    WorkspaceBody,
    WorkspaceGuide,
    WorkspaceIdentity,
    WorkspaceMeta,
    WorkspacePanel,
    WorkspaceHeaderControls,
    WorkspaceClose,
} from "../../framework/Workspace";

export default function IdentityWorkspace({

    initialCapability = "identity",
    state,
    actions,

}) {

    const capability = initialCapability;

    const {

        values,
        form,

        editing,

        activeSteps,
        currentStep,
        sectionId,

    } = state;

    const {

        header,
        progress,
        sections,

    } = buildCapabilityWorkspace({

        capability,
        state,
        actions,

    });

    return (

        <WorkspaceShell>

            <WorkspaceClose
                onClick={header.onClose}
            />

            <WorkspaceMain>
<WorkspaceRegionHeader>

<WorkspaceIdentity

    title={header.title}

    subtitle={header.subtitle}

/>

<WorkspaceMeta>

    <ProfileCapabilitySelector
        values={values}
        setValue={form.setValue}
        readOnly={!editing}
    />

    <WorkspaceCompletion
        model={progress}
    />

</WorkspaceMeta>

</WorkspaceRegionHeader>

<WorkspaceWorkflow>

    <WorkspaceTabs
        model={sections}
    />

</WorkspaceWorkflow>

                <WorkspaceWorkflow>

                    <WorkspaceTabs
                        model={sections}
                    />

                </WorkspaceWorkflow>

                <WorkspaceBody>

                    <CapabilityRenderer
                        capability={capability}
                        sectionId={sectionId}
                        activeSteps={activeSteps}
                        currentStep={currentStep}
                        form={form}
                        editing={editing}
                    />

                </WorkspaceBody>

            </WorkspaceMain>

            <WorkspaceSidebar>

                <WorkspaceGuide
                    title="Identity Guide"
                >

                    <WorkspacePanel title="Welcome">

                        Manage your trusted identity.

                    </WorkspacePanel>

                    <WorkspacePanel>

                        {progress.value}% 

                    </WorkspacePanel>

                    <WorkspacePanel title="Current Section">

                        Personal Details

                    </WorkspacePanel>

                </WorkspaceGuide>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}