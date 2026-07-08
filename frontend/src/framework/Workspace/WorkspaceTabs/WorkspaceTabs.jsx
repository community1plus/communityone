import "./WorkspaceTabs.css";

export default function WorkspaceTabs({

    steps = [],
    currentStep = 0,
    setCurrentStep,

}) {

    return (

        <nav className="workspace-tabs">

            {steps.map((step, index) => (

                <button
                    key={step.id}
                    type="button"
                    className={`workspace-tab ${
                        index === currentStep ? "active" : ""
                    }`}
                    onClick={() => setCurrentStep(index)}
                >

                    {step.title}

                </button>

            ))}

        </nav>

    );

}