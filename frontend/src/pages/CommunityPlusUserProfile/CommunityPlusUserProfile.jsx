import { useNavigate } from "react-router-dom";

import useAPI from "../../hooks/useAPI";

import { useProfile } from "../../context/ProfileContext";

import ProfileSectionCard
  from "../../components/Profile/ProfileSectionCard";

import ProfileHelpPanel
  from "../../components/Profile/ProfileHelpPanel";

import ProfileSocialSection
  from "../../components/Profile/ProfileSocialSection";

import ProfilePaymentSection from "../../components/Profile/ProfilePaymentSection";

import {
  useState,
  useCallback,
} from "react";



import {
  useAuth,
} from "../../context/AuthContext";


import useForm
  from "../../hooks/useForm";

import "./CommunityPlusUserProfile.css";

import {
  PERSONAL_STEPS,
} from "./profileConstants";

import {
  getInitialProfileValues,
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

useEffect(() => {

  sessionStorage.setItem(
    "profileCurrentStep",
    currentStep
  );

}, [currentStep]);


  console.log("CURRENT STEP:", currentStep);
  const activeSteps = PERSONAL_STEPS;

  const form = useForm({

    initialValues:
      getInitialProfileValues(
        profile,
        user
      ),

  });

  const {
    values,
    clearStorage,
  } = form;

  const closeProfile =
    useCallback(() => {

      navigate(
        "/communityplus",
        {
          replace: true,
        }
      );

    }, [navigate]);
    

  const handleSaveProfile =
  useCallback(
    async () => {

      try {

        setSavingProfile(
          true
        );

        const payload =
          buildProfilePayload({

            values,

            userEmail:
              user?.email,

            homeLocation:
              values.homeLocation,

          });

        await patchProfile(payload);

console.log(
  "✔ Profile saved."
);

await loadProfile({
  background: false,
});


      }
      catch (err) {

        console.error(
          "Profile save failed:",
          err
        );

      }
      finally {

        setSavingProfile(
          false
        );

      }

    },

    [
      values,
      user,
      patchProfile,
      loadProfile,
    ]
  );

  const sectionId =
  activeSteps[currentStep]?.id;

console.log(
  "SECTION:",
  sectionId
);

if (sectionId === "social") {

  console.log(
    "ABOUT TO RENDER SOCIAL"
  );

}
  return (

  <div className="profile-page">
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-left">
          {/* HEADER */}

          <div className="profile-content-card">

            <div className="profile-card-header">

              <h1>USER PROFILE</h1>

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
            <ProfileSectionTabs
              steps={activeSteps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />

          {/* PROGRESS */}

          <div className="profile-header-progress">

            <div className="profile-header-progress-label">

              {Math.round(

                activeSteps.length
                  ? (
                      (currentStep + 1)
                      /
                      activeSteps.length
                    ) * 100
                  : 0

              )}% Complete

            </div>

            <div className="profile-progress-bar">

              <div
                className="profile-progress-fill"
                style={{

                  width: `${
                    activeSteps.length
                      ? (
                          (currentStep + 1)
                          /
                          activeSteps.length
                        ) * 100
                      : 0
                  }%`

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
      />

    </ProfileSectionCard>

  )}

</div>

          </div>

          {/* TABS */}
          
      </div>

      {/* RIGHT COLUMN */}

<div className="profile-sidebar">

  <aside className="profile-guide">

    <ProfileHelpPanel
      section={
        activeSteps[currentStep]?.id
      }getAccountLabel
    />
  </aside>

<div className="profile-floating-save">

{sectionId !== "social" && (

  <div className="profile-floating-save">

    <button
      type="button"
      className="profile-save-button"
      disabled={savingProfile}
      onClick={handleSaveProfile}
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