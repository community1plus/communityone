import { buildIdentityWorkspace } from "./buildIdentityWorkspace";
import { buildWalletWorkspace } from "./buildWalletWorkspace";

export function buildCapabilityWorkspace({
    capability,
    state,
    actions,
}) {
    switch (capability) {

        case "wallet":
            return buildWalletWorkspace(
                state,
                actions
            );

        case "identity":
        default:
            return buildIdentityWorkspace(
                state,
                actions
            );
    }
}