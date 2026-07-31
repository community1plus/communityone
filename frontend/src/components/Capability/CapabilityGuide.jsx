import IdentityGuide from "../Identity/IdentityGuide";

export default function CapabilityGuide({

    capability,
    section,

}) {

    switch (capability) {

        case "identity":

        default:

            return (
                <IdentityGuide
                    section={section}
                />
            );

    }

}