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
    WorkspaceCard,
    WorkspaceCardBody,
} from "../../framework/Workspace";

import WorkspaceForm from "../../framework/Workspace/Form/WorkspaceForm";
import IdentityActions from "../../components/Identity/IdentityActions";
import IdentityHelpPanel from "../../components/Identity/IdentityHelpPanel";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";
import IdentitySocialSection from "../../components/Identity/IdentitySocialSection";
import IdentityPaymentSection from "../../components/Identity/IdentityPaymentSection";
import IdentitySectionRenderer from "../IdentityWorkspace/sections/IdentitySectionRenderer";
import FormBuilder from "../../components/UI/Form/FormBuilder";

export default function IdentityWorkspace({

    state,
    actions,

}) {

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

    return (

<WorkspaceShell>

    <WorkspaceMain>

        <WorkspaceRegionHeader>

            <WorkspaceHeader
                title="IDENTITY"
                subtitle="Your trusted identity."
                onClose={editMode ? closeProfile : undefined}
            />

        </WorkspaceRegionHeader>

        <WorkspaceWorkflow>

            <IdentityCapabilitySelector
                values={values}
                setValue={form.setValue}
                readOnly={!editing}
            />

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

            <IdentitySectionRenderer
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

            <IdentityHelpPanel
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