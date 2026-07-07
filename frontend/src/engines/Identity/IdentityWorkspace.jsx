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

import WorkspaceGuide from "../../components/Identity/WorkspaceGuide";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";
import IdentitySectionCard from "../../components/Identity/IdentitySectionCard";
import IdentitySocialSection from "../../components/Identity/IdentitySocialSection";
import IdentityPaymentSection from "../../components/Identity/IdentityPaymentSection";

import WorkspaceTabs from "../../components/UI/WorkspaceTabs";
import FormBuilder from "../../components/UI/Form/FormBuilder";

export default function IdentityWorkspace({

  state,
  actions,

}) {

  /* =====================================
     CONTROLLER MODEL
  ===================================== */

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

  /* =====================================
     RENDER
  ===================================== */

  return (

    <WorkspaceShell>

      <WorkspaceMain>

        <WorkspaceHeader
          title="IDENTITY"
          subtitle="Your trusted identity within Community One."
          onClose={
            editMode
              ? closeProfile
              : undefined
          }
        />

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

          <div className="profile-form-content">

            {sectionId === "social" ? (

              <IdentitySectionCard>

                <IdentitySocialSection />

              </IdentitySectionCard>

            ) : sectionId === "payment" ? (

              <IdentitySectionCard>

                <IdentityPaymentSection />

              </IdentitySectionCard>

            ) : (

              <IdentitySectionCard>

                <FormBuilder
                  steps={[activeSteps[currentStep]]}
                  currentStep={0}
                  form={form}
                  readOnly={!editing}
                />

              </IdentitySectionCard>

            )}

          </div>

        </WorkspaceBody>

      </WorkspaceMain>

      <WorkspaceSidebar>

        <WorkspaceGuide>

          <IdentityGuide
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