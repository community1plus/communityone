const steps = [
  "Identity",
  "Home Address",
  "Contact",
  "Social",
  "Payment Details",
];

const [currentStep, setCurrentStep] = useState(0);

const nextStep = () => {
  if (currentStep < steps.length - 1) {
    setCurrentStep((s) => s + 1);
  }
};

const prevStep = () => {
  if (currentStep > 0) {
    setCurrentStep((s) => s - 1);
  }
};