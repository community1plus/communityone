import IdentityHelpPanel from "../Identity/IdentityHelpPanel";

export default function CapabilityGuide({

    capability,
    section,

}) {

    switch (capability) {

        case "identity":

        default:

            return (
                <IdentityHelpPanel
                    section={section}
                />
            );

    }

}