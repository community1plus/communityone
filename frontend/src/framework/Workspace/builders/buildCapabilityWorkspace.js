import { buildIdentityWorkspace } from "./buildIdentityWorkspace";
import { buildWalletWorkspace } from "./buildWalletWorkspace";
import { buildEntityWorkspace } from "./buildEntityWorkspace";

export function buildCapabilityWorkspace({
    capability = "identity",
    state,
    actions,
}) {
    switch (capability) {
        case "entity":
            return buildEntityWorkspace(state, actions);

        case "wallet":
            return buildWalletWorkspace(state, actions);

        case "identity":
        default:
            return buildIdentityWorkspace(state, actions);
    }
}