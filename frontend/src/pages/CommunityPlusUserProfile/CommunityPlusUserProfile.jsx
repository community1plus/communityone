import ProfileHelpPanel
  from "../../components/Profile/ProfileHelpPanel";
  
import ProfileSocialSection
  from "../../components/Profile/ProfileSocialSection";

import {
  useState,
  useCallback,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useProfile,
} from "../../context/ProfileContext";

import useAPI
  from "../../hooks/useAPI";

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

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const {
    profile,
    refreshProfile,
  } = useProfile();

  const {
    patchProfile,
  } = useAPI();

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

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

        await patchProfile(
          payload
        );

        await refreshProfile();

        clearStorage();

        if (
          typeof onComplete ===
          "function"
        ) {

          onComplete(
            payload
          );

        }

        navigate(
          "/communityplus",
          {
            replace: true,
          }
        );

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
      refreshProfile,
      clearStorage,
      onComplete,
      navigate,

    ]

  );

  const sectionId =
  activeSteps[currentStep]?.id;

  return (

  <div className="profile-page">

    <div className="profile-container">

      <div className="profile-layout">

        <div className="profile-left">

          {/* HEADER */}

          <div className="profile-header">

            <div className="profile-title-row">

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

          </div>

          {/* TABS */}

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

{
 sectionId === "social" ? (

   <ProfileSocialSection />

 ) : sectionId === "payment" ? (

   <ProfilePaymentSection />

 ) : (

   <FormBuilder
      steps={[activeSteps[currentStep]]}
      currentStep={0}
      form={form}
   />

 )
}

          {/* FOOTER */}

          <div className="profile-footer">

            <button
              type="button"
              className="primary-button"
              disabled={savingProfile}
              onClick={handleSaveProfile}
            >

              {

                savingProfile
                  ? "Saving..."
                  : editMode
                    ? "Save"
                    : "Save & Continue"

              }

            </button>

          </div>

        </div>

        {/* GUIDE PANEL */}

        <aside className="profile-guide">

          <ProfileHelpPanel
            section={
              activeSteps[currentStep]?.id
            }
          />

        </aside>

      </div>

    </div>

  </div>

);
}