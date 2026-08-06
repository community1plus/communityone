import CapabilityRenderer from "../../components/Capability/CapabilityRenderer";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";

import { buildCapabilityWorkspace } from "../../framework/Workspace/builders/buildCapabilityWorkspace";

import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceSidebar,
    WorkspaceRegionHeader,
    WorkspaceIdentity,
    WorkspaceToolbar,
    WorkspaceWorkflow,
    WorkspaceTabs,
    WorkspaceCompletion,
    WorkspaceBody,
    WorkspaceGuide,
    WorkspacePanel,
    WorkspaceTitle,
    WorkspaceSubtitle,
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

    <WorkspaceToolbar>

        <WorkspaceTitle
            title={header.title}
        />

        <IdentityCapabilitySelector
            values={values}
            setValue={form.setValue}
            readOnly={!editing}
        />

        <WorkspaceCompletion
            model={progress}
        />

    </WorkspaceToolbar>

    <WorkspaceSubtitle>

        {header.subtitle}

    </WorkspaceSubtitle>

    <WorkspaceTabs
        model={sections}
    />

</WorkspaceRegionHeader>

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

                    <WorkspacePanel
                        title="Welcome"
                    >

                        Manage your trusted identity.

                    </WorkspacePanel>

                    <WorkspacePanel
                        title="Profile Completion"
                    >

                        {progress.value}%

                    </WorkspacePanel>

                    <WorkspacePanel
                        title="Current Section"
                    >

                        Personal Details

                    </WorkspacePanel>

                </WorkspaceGuide>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}