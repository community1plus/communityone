import { useNavigate } from "react-router-dom";
import IdentityWorkspace from "../../engines/Identity/IdentityWorkspace";
import useAPI from "../../hooks/useAPI";
import { useProfile } from "../../context/ProfileContext";
import { useState, useCallback, useMemo } from "react";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import useForm from "../../hooks/useForm";
import "./CommunityPlusUserProfile.css";
import { PROFILE_STEPS, ORG_STEPS}  from "./profileConstants";
import { getInitialProfileValues, calculateProfileCompletion } from "./profileHelpers";
import { buildProfilePayload } from "./profilePayload";

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

/* =====================================
   WORKSPACE MODEL
===================================== */

const workspaceState = {
  values,
  form,
  editing,
  editMode,
  savingProfile,
  completion,
  activeSteps,
  currentStep,
  sectionId,
};

const workspaceActions = {
  setCurrentStep,
  setEditing,
  handleSaveProfile,
  closeProfile,
  resetForm: form.reset,
};

return (

<IdentityWorkspace
    state={workspaceState}
    actions={workspaceActions}
/>

);

}