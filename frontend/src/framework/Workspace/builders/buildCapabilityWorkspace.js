import { buildIdentityWorkspace } from "./buildIdentityWorkspace";
import { buildWalletWorkspace } from "./buildWalletWorkspace";


export function buildCapabilityWorkspace({

    capability = "profile",

    state,

    actions,

}) {

    switch (capability) {

        case "wallet":

            return buildWalletWorkspace(
                state,
                actions
            );


        case "profile":

        default:

            return buildIdentityWorkspace(
                state,
                actions
            );

    }

}