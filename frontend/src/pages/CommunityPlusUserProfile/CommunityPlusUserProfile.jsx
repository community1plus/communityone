import ProfileHelpPanel
  from "../../components/Profile/ProfileHelpPanel";

import {
  useState,
  useMemo,
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

import useAPI from "../../hooks/useAPI";
import useForm from "../../hooks/useForm";

import "./CommunityPlusUserProfile.css";

import {
  PERSONAL_STEPS,
  ORG_STEPS,
  COMMUNITY_POLICY_STEPS,
} from "./profileConstants";

import {
  getInitialProfileValues,
  getAllowedProfileTabs,
} from "./profileHelpers";

import {
  buildProfilePayload,
} from "./profilePayload";



import ProfileSectionTabs
  from "../../components/UI/ProfileSectionTabs";

import ProfileNavigation
  from "../../components/UI/ProfileNavigation";

import FormBuilder
  from "../../components/UI/Form/FormBuilder";

export default function CommunityPlusUserProfile({
  onComplete,
}) {

  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    profile,
    refreshProfile,
  } = useProfile();

  const { patchProfile } =
    useAPI();

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [editMode, setEditMode] =
    useState(false);

  const [activeProfileTab, setActiveProfileTab] =
    useState("PERSONAL");

  const [currentStep, setCurrentStep] =
    useState(0);

  /* =========================
     FORM
  ========================= */

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

  /* =========================
     ACCOUNT TABS
  ========================= */

  const allowedProfileTabs =
    useMemo(
      () =>
        getAllowedProfileTabs(
          user?.email
        ),
      [user]
    );

  /* =========================
     STEPS
  ========================= */

  const activeSteps =
    useMemo(() => {

      switch (activeProfileTab) {

        case "ORG":
          return ORG_STEPS;

        case "COMMUNITY_POLICIES":
          return COMMUNITY_POLICY_STEPS;

        default:
          return PERSONAL_STEPS;

      }

    }, [activeProfileTab]);

  /* =========================
     CLOSE
  ========================= */

  const closeProfile =
    useCallback(() => {

      navigate(
        "/communityplus",
        {
          replace: true,
        }
      );

    }, [navigate]);

  /* =========================
     SAVE
  ========================= */

  const handleSaveProfile =
    useCallback(async () => {

      try {

        setSavingProfile(true);

        const payload =
          buildProfilePayload({

            values,

            activeProfileTab,

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

          onComplete(payload);

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

        setSavingProfile(false);

      }

    }, [

      values,
      activeProfileTab,
      user,
      patchProfile,
      refreshProfile,
      clearStorage,
      onComplete,
      navigate,

    ]);

  return (

    <div className="profile-page">

      <div className="profile-container">

        <div className="profile-layout">

          <div className="profile-left">

            {/* HEADER */}

            <div className="profile-header">

<div className="profile-title">

  <h1>
    USER PROFILE
  </h1>

  <div className="profile-account-type">
    ORGANISATION ACCOUNT
  </div>

</div>

              <div className="profile-header-progress">

                <div className="profile-header-progress-label">

                  {Math.round(

                    (
                      (currentStep + 1)
                      /
                      activeSteps.length
                    ) * 100

                  )}% Complete

                </div>

                <div className="profile-progress-bar">

                  <div
                    className="profile-progress-fill"
                    style={{

                      width: `${

                        (
                          (currentStep + 1)
                          /
                          activeSteps.length
                        ) * 100

                      }%`

                    }}
                  />

                </div>

              </div>

            </div>

            {/* ACCOUNT TYPE */}

            

            {/* SECTION TABS */}

            <ProfileSectionTabs
              steps={activeSteps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />

            {/* FORM */}

            <FormBuilder
              steps={[
                activeSteps[currentStep]
              ]}
              currentStep={0}
              form={form}
              readOnly={!editMode}
            />

            {/* BUTTONS */}

            <button
              className="profile-close-button"
              onClick={closeProfile}
            >
              ×
            </button>

            <ProfileNavigation
              editMode={editMode}
              saving={savingProfile}
              onEdit={() => setEditMode(true)}
              onSave={handleSaveProfile}
            />

          </div>

          {/* GUIDE */}

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