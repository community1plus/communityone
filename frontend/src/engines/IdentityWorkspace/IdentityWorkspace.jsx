import { createWorkspace } from "../../framework/Workspace/builders/createWorkspace";
import { createWorkspaceHeaderModel } from "../../framework/Workspace/models/WorkspaceHeaderModel";
import { createWorkspaceProgressModel } from "../../framework/Workspace/models/WorkspaceProgressModel";
import { createWorkspaceSectionsModel } from "../../framework/Workspace/models/WorkspaceSectionsModel";
import CapabilityRenderer from "../../components/Capability/CapabilityRenderer";
import CapabilityGuide from "../../components/Capability/CapabilityGuide";
import WalletSectionRenderer from "../../capabilities/sections/WalletSectionRenderer";
import { useState } from "react";
import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceSidebar,
    WorkspaceHeader,
    WorkspaceRegionHeader,
    WorkspaceWorkflow,
    WorkspaceProgress,
    WorkspaceBody,
    WorkspaceGuide,
    WorkspaceActions,
    WorkspaceTabs,
} from "../../framework/Workspace";

import IdentityActions from "../../components/Identity/IdentityActions";
import IdentityHelpPanel from "../../components/Identity/IdentityHelpPanel";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";
import IdentitySectionRenderer from "../IdentityWorkspace/sections/IdentitySectionRenderer";
import { buildIdentityWorkspace }
from "../../framework/Workspace/builders/buildIdentityWorkspace";



export default function IdentityWorkspace({
    state,
    actions,
}) {
    const [capability, setCapability] =
    useState("identity");

    const {
        values,
        form,

        editing,
        editMode,
        savingProfile,

        completion,

        activeSteps,
        currentStep,
        sectionId,
    } = state;

    const {
        setCurrentStep,
        setEditing,

        handleSaveProfile,
        closeProfile,
    } = actions;


    const workspace =
    buildIdentityWorkspace(state, actions);
    //
    // Workspace Models
    //

  console.log("Capability:", capability);

    return (

        <WorkspaceShell>

            <WorkspaceMain>

                <WorkspaceRegionHeader>

                    <WorkspaceHeader model={workspace.header} />

                </WorkspaceRegionHeader>

                <WorkspaceWorkflow>

                    <IdentityCapabilitySelector
                        values={values}
                        setValue={form.setValue}
                        readOnly={!editing}
                    />

                    <WorkspaceTabs
                        model={workspace.sections}
                    />

                </WorkspaceWorkflow>

                <WorkspaceProgress
                    model={workspace.progress}
                />

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

<WorkspaceGuide>

    <CapabilityGuide
        capability={capability}
        section={sectionId}
    />

</WorkspaceGuide>

                <WorkspaceActions>

                    <IdentityActions
                        editing={editing}
                        savingProfile={savingProfile}
                        form={form}
                        setEditing={setEditing}
                        handleSaveProfile={handleSaveProfile}
                    />

                </WorkspaceActions>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}