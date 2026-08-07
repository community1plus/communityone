import CapabilityRenderer from "../../components/Capability/CapabilityRenderer";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";

import { buildCapabilityWorkspace } from "../../framework/Workspace/builders/buildCapabilityWorkspace";
//
import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceContent,
    WorkspaceSidebar,

    WorkspaceRegionHeader,
    WorkspaceBanner,
    WorkspaceBannerSection,

    WorkspaceNavigation,

    WorkspaceTitle,
    WorkspaceMode,
    WorkspaceMetric,

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
                onClick={banner.onClose}
            />

            <WorkspaceMain>

                <WorkspaceContent>

                    <WorkspaceRegionHeader>

                        <WorkspaceBanner>

                            <WorkspaceBannerSection>

                                <WorkspaceTitle
    title={banner.title}
/>

                            </WorkspaceBannerSection>

                            <WorkspaceBannerSection>

                                <WorkspaceMode>

                                    <IdentityCapabilitySelector
                                        values={values}
                                        setValue={form.setValue}
                                        readOnly={!editing}
                                    />

                                </WorkspaceMode>

                            </WorkspaceBannerSection>

                            <WorkspaceBannerSection>

                                <WorkspaceMetric
    model={banner.metric}
/>

                            </WorkspaceBannerSection>

                        </WorkspaceBanner>

                    </WorkspaceRegionHeader>

                    <WorkspaceNavigation
                        model={navigation}
                    />

                    <WorkspaceBody>

                        {/* Legacy renderer adapter */}
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

                        {banner.metric.value}%

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