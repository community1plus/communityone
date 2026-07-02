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

import ProfileHelpPanel from "../../components/Profile/ProfileHelpPanel";
import ProfileCapabilitySelector from "../../components/Profile/ProfileCapabilitySelector";
import ProfileSectionTabs from "../../components/UI/ProfileSectionTabs";
import ProfileSectionCard from "../../components/Profile/ProfileSectionCard";
import ProfileSocialSection from "../../components/Profile/ProfileSocialSection";
import ProfilePaymentSection from "../../components/Profile/ProfilePaymentSection";
import FormBuilder from "../../components/UI/Form/FormBuilder";

export default function IdentityWorkspace({

  state,

  actions,

}) {

  const {
    values,
    form,
    editing,
    activeSteps,
    currentStep,
    sectionId,
  } = state;

  const {

    setCurrentStep,

  } = actions;
    <div className="profile-page">
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-left">
          {/* HEADER */}

          <div className="profile-content-card">

            <div className="profile-card-header">

              <h1>COMMUNITY PROFILE</h1>

              <p className="profile-subtitle">
                  Your trusted identity within Community One.
              </p>

              {editMode && (

                <button
                  type="button"
                  className="profile-close-button"
                  onClick={closeProfile}
                >
                  ×
                </button>

              )}

            </div>

          {/* PROGRESS */}

<WorkspaceProgress

    value={completion}

    label={`${completion}% Complete`}
/>
          {/* FORM */}

          </div>

          {/* TABS */}
          
      </div>

      {/* RIGHT COLUMN */}

<div className="profile-sidebar">

<div className="profile-floating-save">

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

</div>

</div>
      </div>

    </div>

  </div>

  return (

     
    <WorkspaceShell>

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

      <WorkspaceContent>

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

      </WorkspaceContent>

      <WorkspaceGuide>

        <ProfileHelpPanel
          section={sectionId}
        />

      </WorkspaceGuide>

    </WorkspaceShell>

  );

}