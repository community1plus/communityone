import IdentityActions from "../Identity/IdentityActions";

export default function CapabilityActions(props) {

    switch (props.capability) {

        case "wallet":
            return (
                <div>
                    Wallet Actions
                </div>
            );

        case "identity":
        default:
            return (
                <IdentityActions {...props} />
            );
    }
}