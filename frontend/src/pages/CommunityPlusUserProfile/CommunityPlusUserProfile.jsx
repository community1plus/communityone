import { useNavigate } from "react-router-dom";
import IdentityWorkspace from "../../engines/Identity/IdentityWorkspace";
import useAPI from "../../hooks/useAPI";

import { useProfile } from "../../context/ProfileContext";

import ProfileSectionCard
  from "../../components/Profile/ProfileSectionCard";

import WorkspaceShell from "../../framework/Workspace/WorkspaceShell";

import ProfileSocialSection
  from "../../components/Profile/ProfileSocialSection";

import ProfilePaymentSection from "../../components/Profile/ProfilePaymentSection";

import ProfileCapabilitySelector from "../../components/Profile/ProfileCapabilitySelector";

import {
  useState,
  useCallback,
  useMemo,
} from "react";

import { useEffect } from "react";

import {
  useAuth,
} from "../../context/AuthContext";


import useForm
  from "../../hooks/useForm";

import "./CommunityPlusUserProfile.css";

import {
  PROFILE_STEPS, ORG_STEPS
} from "./profileConstants";

import {
  getInitialProfileValues, calculateProfileCompletion
} from "./profileHelpers";


import {
  buildProfilePayload,
} from "./profilePayload";

import ProfileSectionTabs
  from "../../components/UI/ProfileSectionTabs";

import FormBuilder
  from "../../components/UI/Form/FormBuilder";

export default function CommunityPlusUserProfile({
  onComplete,
  editMode = false,
}) {
 console.log("USER PROFILE COMPONENT MOUNTED");
  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const {
    profile,
    loadProfile,
  } = useProfile();

  const {
    patchProfile,
  } = useAPI();

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);



const [currentStep, setCurrentStep] = useState(() => {

  const saved =
    sessionStorage.getItem(
      "profileCurrentStep"
    );

  return saved
    ? Number(saved)
    : 0;

});

console.log("AUTH USER:", user); 

useEffect(() => {

  sessionStorage.setItem(
    "profileCurrentStep",
    currentStep
  );

}, [currentStep]);


const [
  editing,
  setEditing,
] = useState(!profile?.id);

/* =====================================
   INITIAL FORM VALUES
===================================== */

const initialValues = useMemo(
  () =>
    getInitialProfileValues(
      profile,
      user
    ),
  [profile, user]
);


/* =====================================
   FORM
===================================== */

const form = useForm({
  initialValues,
});

const {
  values,
  clearStorage,
} = form;

const completion =
  calculateProfileCompletion(values);

/* =====================================
   PROFILE STEPS
   (Organisation steps will be added
   in the next commit.)
===================================== */

const activeSteps = useMemo(() => {

    const steps = [...PROFILE_STEPS];

    if (values.capabilities?.organisation) {

        steps.splice(
            3,
            0,
            ...ORG_STEPS
        );

    }

    return steps;

}, [values.capabilities]);

console.log(activeSteps);

console.log(
  "CURRENT STEP:",
  currentStep
);

const sectionId =
  activeSteps[currentStep]?.id;

console.log(
  "SECTION:",
  sectionId
);
/* =====================================
   CLOSE PROFILE
===================================== */
const closeProfile = useCallback(() => {

  navigate("/communityplus", {
    replace: true,
  });

}, [navigate]);

/* =====================================
   SAVE PROFILE
===================================== */

const handleSaveProfile = useCallback(

  async () => {

    try {

      setSavingProfile(true);

      const payload =
        buildProfilePayload({

          values,

          userEmail:
            user?.email,

          homeLocation:
            values.homeLocation,

        });

      console.log(
        "PROFILE PAYLOAD",
        JSON.stringify(payload, null, 2)
      );

      await patchProfile(payload);

      console.log(
        "✔ Profile saved."
      );

      await loadProfile({
        background: false,
      });

      if (onComplete) {
        onComplete();
      }

    } catch (err) {

      console.error(
        "Profile save failed:",
        err
      );

    } finally {

      setSavingProfile(false);

    }

  },

  [
    values,
    user,
    patchProfile,
    loadProfile,
    onComplete,
  ]

);


if (sectionId === "social") {

  console.log(
    "ABOUT TO RENDER SOCIAL"
  );

}
console.log("Completion:", completion);
console.log("Values:", values);

  return (

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

          {/* PROGRESS */}

<div className="profile-header-progress">

  <div className="profile-header-progress-label">
    {completion}% Complete
  </div>

  <div className="profile-progress-bar">

    <div
      className="profile-progress-fill"
      style={{
        width: `${completion}%`,
      }}
    />

  </div>

</div>

          {/* FORM */}

          
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

);




}