import { useState, useMemo } from "react";

/* =========================
   INSIDE COMPONENT
========================= */

const [currentStep, setCurrentStep] = useState(0);

const steps = PROFILE_STEPS.map((s) => s.title);

/* =========================
   PROGRESS
========================= */

const progress = ((currentStep + 1) / PROFILE_STEPS.length) * 100;

/* =========================
   STEP VALIDATION
========================= */

const validateStep = async () => {
  const stepFields = PROFILE_STEPS[currentStep].fields;

  // mark all fields touched
  stepFields.forEach((field) => {
    form.setTouched(field.name, true);
  });

  const isValid = await form.validateAll();

  const hasErrors = stepFields.some((field) =>
    form.getError(field.name)
  );

  return isValid && !hasErrors;
};

/* =========================
   NAVIGATION
========================= */

const nextStep = async () => {
  const ok = await validateStep();
  if (!ok) return;

  setCurrentStep((s) =>
    Math.min(s + 1, PROFILE_STEPS.length - 1)
  );
};

const prevStep = () =>
  setCurrentStep((s) => Math.max(s - 1, 0));

/* =========================
   RENDER
========================= */

return (
  <div className="profile-container">

    {/* HEADER */}
    <div className="profile-page-header">
      <div className="profile-page-title">Edit Profile</div>
      <div className="meta">
        Complete your profile to unlock platform features
      </div>

      {/* 🔥 STEPPER */}
      <div className="profile-stepper">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="profile-page-steps">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isComplete = i < currentStep;

            return (
              <div
                key={step}
                className={`step 
                  ${isActive ? "active" : ""} 
                  ${isComplete ? "complete" : ""}
                `}
                onClick={() => setCurrentStep(i)}
              >
                {step}
              </div>
            );
          })}
        </div>

      </div>
    </div>

    {/* LAYOUT */}
    <div className="profile-layout">

      {/* LEFT */}
      <div className="profile-left">

        <FormBuilder
          steps={PROFILE_STEPS}
          currentStep={currentStep}
          form={form}
          extra={extra}
        />

        {/* NAV */}
        <div className="form-navigation">

          <button className="btn btn-ghost" onClick={prevStep}>
            Back
          </button>

          {currentStep < PROFILE_STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>

      </div>

      {/* RIGHT */}
      <div className="profile-guide">
        <div className="h3">Profile Guide</div>
        <div className="meta">
          Add details to improve visibility and trust
        </div>
      </div>

    </div>

  </div>
);