export default function CommunityPlusUserProfile({
  onComplete,
}) {

  const navigate = useNavigate();

  const {
    user,
  } = useAuth();

  const {
    profile,
    profileReady,
    refreshProfile,
  } = useProfile();

  const {
    patchProfile,
  } = useAPI();

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [editMode, setEditMode] =
    useState(false);

  const [activeProfileTab, setActiveProfileTab] =
    useState("PERSONAL");

  const [currentStep, setCurrentStep] =
    useState(0);

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

const {

  businessEmailStatus,

  businessEmailError,

  sendBusinessEmailCode,

  verifyBusinessEmailCode,

} = useBusinessEmailVerification({

  values,

  patchProfile,

});

const activeSteps = useMemo(() => {

  switch (activeProfileTab) {

    case "ORG":
      return ORG_STEPS;

    case "COMMUNITY_POLICIES":
      return COMMUNITY_POLICY_STEPS;

    default:
      return PERSONAL_STEPS;

  }

}, [
  activeProfileTab,
]);

const currentStepConfig =
  activeSteps[currentStep];

const saveProfile =
  useCallback(
async () => {

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

  patchProfile,

  refreshProfile,

  clearStorage,

  onComplete,

  navigate,

]);

return (

<div className="profile-page">

  <ProfileTabs

    tabs={allowedProfileTabs}

    activeTab={
      activeProfileTab
    }

    onChange={
      setActiveProfileTab
    }

  />

  <FormBuilder

    steps={activeSteps}

    currentStep={
      currentStep
    }

    form={form}

    readOnly={
      !editMode
    }

  />

  <ProfileNavigation

    editMode={
      editMode
    }

    saving={
      savingProfile
    }

    onClose={
      closeProfile
    }

    onEdit={() =>
      setEditMode(true)
    }

    onSave={
      saveProfile
    }

  />

</div>

);

}

