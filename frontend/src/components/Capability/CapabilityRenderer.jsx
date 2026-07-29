import IdentitySectionRenderer
from "../../engines/IdentityWorkspace/sections/IdentitySectionRenderer";

export default function CapabilityRenderer({

    capability,
    sectionId,
    activeSteps,
    currentStep,
    form,
    editing,

}) {

    switch (capability) {

        case "identity":

        default:

            return (

                <IdentitySectionRenderer
                    sectionId={sectionId}
                    activeSteps={activeSteps}
                    currentStep={currentStep}
                    form={form}
                    editing={editing}
                />

            );

    }

}