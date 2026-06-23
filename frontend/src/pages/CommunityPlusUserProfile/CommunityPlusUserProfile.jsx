import ProfileSectionTabs
  from "../../components/UI/ProfileSectionTabs";

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
/**/
import useAPI from "../../hooks/useAPI";
import "./CommunityPlusUserProfile.css";
import useForm from "../../hooks/useForm";

import {
  PERSONAL_STEPS,
  ORG_STEPS,
  COMMUNITY_POLICY_STEPS,
} from "./profileConstants";

import {
  getInitialProfileValues,
  getAllowedProfileTabs,
  getPhoneCountry,
} from "./profileHelpers";

import {
  buildProfilePayload,
} from "./profilePayload";

import usePhoneVerification
  from "../../hooks/usePhoneVerification";

import useBusinessEmailVerification
  from "../../hooks/useBusinessEmailVerification";

import ProfileTabs from "../../components/UI/ProfileTabs";

import ProfileNavigation from "../../components/UI/ProfileNavigation";

import FormBuilder from "../../components/UI/Form/FormBuilder";

export default function CommunityPlusUserProfile({
  onComplete,
}) {

  /* =========================
     NAVIGATION
  ========================= */

  const navigate = useNavigate();

  /* =========================
     CONTEXTS
  ========================= */

  const { user } = useAuth();

  const {
    profile,
    profileReady,
    refreshProfile,
  } = useProfile();

  const {
    patchProfile,
  } = useAPI();

  /* =========================
     LOCAL STATE
  ========================= */

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
    initialValues: getInitialProfileValues(
      profile,
      user
    ),

    persistKey:
      "communityplus_profile",
  });

  const {
    values,
    setValue,
    clearStorage,
  } = form;

  /* =========================
     ALLOWED TABS
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
     PHONE VERIFICATION
  ========================= */

  const {
    phoneStatus,
    phoneError,
    sendPhoneCode,
    verifyPhoneCode,
  } = usePhoneVerification({
    values,

    selectedPhoneCountry:
      getPhoneCountry(
        values.phoneCountry
      ),

    setValue,

    patchProfile,
  });

  /* =========================
     BUSINESS EMAIL
  ========================= */

  const {
    businessEmailStatus,
    businessEmailError,
    sendBusinessEmailCode,
    verifyBusinessEmailCode,
  } = useBusinessEmailVerification({
    values,
    patchProfile,
  });

  /* =========================
     ACTIVE STEPS
  ========================= */

  const activeSteps = useMemo(() => {

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
     CLOSE PROFILE
  ========================= */

  const closeProfile = useCallback(() => {

    navigate(
      "/communityplus",
      {
        replace: true,
      }
    );

  }, [navigate]);

  /* =========================
     SAVE PROFILE
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

  /* =========================
     RENDER
  ========================= */

return (

<div className="profile-page">

  <div className="profile-container">

    <div className="profile-layout">

      <div className="profile-left">
<div className="profile-header">

  <h1>
    USER PROFILE
  </h1>

</div>
        <ProfileTabs
          tabs={allowedProfileTabs}
          activeTab={activeProfileTab}
          onChange={setActiveProfileTab}
        />
        <div className="profile-completion">

  <div className="profile-completion-header">

    <span>Profile completion</span>

    <span>
{Math.round(
  ((currentStep + 1) /
    activeSteps.length) *
    100
)}%
    </span>

  </div>

  <div className="profile-progress-bar">

    <div
      className="profile-progress-fill"
      style={{
width: `${
  activeSteps.length
    ? ((currentStep + 1) /
        activeSteps.length) *
      100
    : 0
}%`,
      }}
    />

  </div>

</div>



<ProfileSectionTabs
  steps={activeSteps}
  currentStep={currentStep}
  setCurrentStep={setCurrentStep}
/>

<FormBuilder
  steps={[
    activeSteps[currentStep]
  ]}
  currentStep={0}
  form={form}
  readOnly={!editMode}
/>

        <ProfileNavigation
          editMode={editMode}
          saving={savingProfile}
          onClose={closeProfile}
          onEdit={() => setEditMode(true)}
          onSave={handleSaveProfile}
        />

      </div>

      <aside className="profile-guide">

        <h2>Profile Guide</h2>

        <p>
          Verify your social accounts to
          prove ownership of pages,
          channels and official accounts.
        </p>

      </aside>

    </div>

  </div>

</div>

);

}