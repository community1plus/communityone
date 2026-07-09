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

import IdentityHelpPanel from "../../components/Identity/IdentityHelpPanel";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";
import IdentitySocialSection from "../../components/Identity/IdentitySocialSection";
import IdentityPaymentSection from "../../components/Identity/IdentityPaymentSection";

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

                    {sectionId === "social" ? (

                        <WorkspaceCard>

                            <WorkspaceCardBody>

                                <IdentitySocialSection />

                            </WorkspaceCardBody>

                        </WorkspaceCard>

                    ) : sectionId === "payment" ? (

                        <WorkspaceCard>

                            <WorkspaceCardBody>

                                <IdentityPaymentSection />

                            </WorkspaceCardBody>

                        </WorkspaceCard>

                    ) : (

                        <WorkspaceCard>

                            <WorkspaceCardBody>

                                <WorkspaceForm>

                                    <FormBuilder
                                        steps={[activeSteps[currentStep]]}
                                        currentStep={0}
                                        form={form}
                                        readOnly={!editing}
                                    />

                                </WorkspaceForm>

                            </WorkspaceCardBody>

                        </WorkspaceCard>

                    )}

                </WorkspaceBody>

            </WorkspaceMain>

            <WorkspaceSidebar>

                <WorkspaceGuide>

                    <IdentityHelpPanel
                        section={sectionId}
                    />

                </WorkspaceGuide>

                <WorkspaceActions>

                    {!editing ? (

                        <button
                            type="button"
                            className="profile-save-button"
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </button>

                    ) : (

                        <div className="profile-edit-actions">

                            <button
                                type="button"
                                className="profile-cancel-button"
                                onClick={() => {

                                    form.reset?.();

                                    setEditing(false);

                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="profile-save-button"
                                disabled={savingProfile}
                                onClick={async () => {

                                    await handleSaveProfile();

                                    setEditing(false);

                                }}
                            >
                                {savingProfile
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    )}

                </WorkspaceActions>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}