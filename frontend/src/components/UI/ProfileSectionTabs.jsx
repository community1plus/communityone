export default function ProfileSectionTabs({
  steps,
  currentStep,
  setCurrentStep,
}) {
  return (

    <div className="profile-section-tabs">

      {steps.map((step, index) => (

        <button
          key={step.id}
          type="button"
          className={`profile-section-tab ${
            currentStep === index
              ? "active"
              : ""
          } ${
            index < currentStep
              ? "complete"
              : ""
          }`}
          onClick={() =>
            setCurrentStep(index)
          }
        >
          {step.title}
        </button>

      ))}

    </div>

  );
}