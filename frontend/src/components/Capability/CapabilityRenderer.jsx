import IdentitySectionRenderer
    from "../../engines/IdentityWorkspace/sections/IdentitySectionRenderer";

import WalletSectionRenderer
    from "../Wallet/WalletSectionRenderer";

export default function CapabilityRenderer({

    capability,

    sectionId,

    activeSteps,
    currentStep,

    form,
    editing,

}) {

    switch (capability) {

        case "wallet":

            return (

                <WalletSectionRenderer
                    section={sectionId}
                />

            );

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