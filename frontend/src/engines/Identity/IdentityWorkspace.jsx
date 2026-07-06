import {
  WorkspaceShell,
  WorkspaceMain,
  WorkspaceSidebar,
  WorkspaceHeader,
  WorkspaceWorkflow,
  WorkspaceProgress,
  WorkspaceBody,
  WorkspaceGuide,
  WorkspaceActions,
} from "../../framework/Workspace";

import ProfileHelpPanel from "../../components/Identity/IdentityHelpPanel";
import ProfileCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";
import ProfileSectionTabs from "../../components/UI/ProfileSectionTabs";

import ProfileSectionCard from "../../components/Identity/IdentitySectionCard";
import ProfileSocialSection from "../../components/Identity/IdentitySocialSection";
import ProfilePaymentSection from "../../components/Identity/IdentityPaymentSection";

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
};

const workspaceActions = {

    setCurrentStep,
    setEditing,

    handleSaveProfile,
    closeProfile,

};

  return (

    <WorkspaceShell>

      <WorkspaceMain>

        <WorkspaceHeader>

<WorkspaceHeader

    title="COMMUNITY PROFILE"

    subtitle="Your trusted identity within Community One."

    onClose={editMode ? closeProfile : undefined}

/>

        </WorkspaceHeader>

        <WorkspaceWorkflow>

          <ProfileCapabilitySelector
            values={values}
            setValue={form.setValue}
            readOnly={!editing}
          />

          <ProfileSectionTabs
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

          <div className="profile-form-content">

            {sectionId === "social" ? (

              <ProfileSectionCard>

                <ProfileSocialSection />

              </ProfileSectionCard>

            ) : sectionId === "payment" ? (

              <ProfileSectionCard>

                <ProfilePaymentSection />

              </ProfileSectionCard>

            ) : (

              <ProfileSectionCard>

                <FormBuilder
                  steps={[activeSteps[currentStep]]}
                  currentStep={0}
                  form={form}
                  readOnly={!editing}
                />

              </ProfileSectionCard>

            )}

          </div>

        </WorkspaceBody>

      </WorkspaceMain>

      <WorkspaceSidebar>

        <WorkspaceGuide>

          <ProfileHelpPanel
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