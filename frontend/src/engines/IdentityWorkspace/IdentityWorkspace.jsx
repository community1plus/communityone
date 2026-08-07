import CapabilityRenderer from "../../components/Capability/CapabilityRenderer";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";

import { buildCapabilityWorkspace } from "../../framework/Workspace/builders/buildCapabilityWorkspace";

import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceContent,
    WorkspaceSidebar,

    WorkspaceRegionHeader,
    WorkspaceBanner,
    WorkspaceNavigation,
    WorkspaceBody,

    WorkspaceGuide,
    WorkspacePanel,

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

        sections,
        currentSection,
        sectionId,

    } = state;

    const {

        banner,
        navigation,

    } = buildCapabilityWorkspace({

        capability,
        state,
        actions,

    });

    return (

        <WorkspaceShell>

            <WorkspaceClose
                onClick={actions.closeProfile}
            />

            <WorkspaceMain>

                <WorkspaceContent>

                    <WorkspaceRegionHeader>

                        <WorkspaceBanner
                            model={banner}
                        >

                            <IdentityCapabilitySelector
                                values={values}
                                setValue={form.setValue}
                                readOnly={!editing}
                            />

                        </WorkspaceBanner>

                    </WorkspaceRegionHeader>

                    <WorkspaceNavigation
                        model={navigation}
                    />

                    <WorkspaceBody>

                        <CapabilityRenderer
                            capability={capability}
                            sectionId={sectionId}
                            activeSteps={sections}
                            currentStep={currentSection}
                            form={form}
                            editing={editing}
                        />

                    </WorkspaceBody>

                </WorkspaceContent>

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

                        {banner.right.metric.value}%

                    </WorkspacePanel>

                    <WorkspacePanel
                        title="Current Section"
                    >

                        {sections[currentSection]?.title}

                    </WorkspacePanel>

                </WorkspaceGuide>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}