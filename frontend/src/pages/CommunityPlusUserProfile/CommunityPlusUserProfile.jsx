return (
  <div className="profile-container">

    {/* HEADER */}
    <div className="profile-page-header">
      <PageHeader
        title="Edit Profile"
        meta="Complete your profile to unlock platform features"
      />

      {/* 🔥 STEPPER (NOW PROPERLY GROUPED) */}
      <div className="profile-stepper">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="profile-page-steps">
          {steps.map((step, i) => {
            const active = i === currentStep;
            const complete = i < currentStep;

            return (
              <div
                key={step}
                className={`step ${active ? "active" : ""} ${complete ? "complete" : ""}`}
                onClick={() => setCurrentStep(i)}
              >
                {step}
              </div>
            );
          })}
        </div>

      </div>
    </div>

    {/* MAIN */}
    <div className="profile-layout">

      {/* LEFT */}
      <div className="profile-left">
        <Section>
          <FormBuilder
            steps={PROFILE_STEPS}
            currentStep={currentStep}
            form={form}
            extra={{
              Autocomplete,
              autoRef,
              manualAddress,
              setManualAddress,
              onPlaceChanged,
              isLoaded,
            }}
          />
        </Section>

        <div className="form-navigation">

          <Button variant="ghost" onClick={() => navigate("/home")}>
            Close
          </Button>

          <div className="form-actions">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
            )}

            {currentStep < PROFILE_STEPS.length - 1 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving || isFormValidating}
              >
                {isFormValidating ? "Validating..." : "Save"}
              </Button>
            )}
          </div>

        </div>

        {error && <div className="error">{error}</div>}
      </div>

      {/* RIGHT */}
      <div className="profile-guide">
        <Section
          title="Profile Guide"
          meta="Add details to improve visibility and trust"
        />
      </div>

    </div>
  </div>
);