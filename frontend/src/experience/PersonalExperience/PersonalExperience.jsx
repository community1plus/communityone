import { useState } from "react";

import WalletWorkspace from "../../capabilities/Wallet/WalletWorkspace";
import { useState } from "react";

import IdentityWorkspace from "../../engines/IdentityWorkspace/IdentityWorkspace";


export default function PersonalExperience({

    workspaceState,
    workspaceActions,

}) {

    const [capability] =
        useState("identity");

    switch (capability) {

        case "wallet":

            return (
                <WalletWorkspace />
            );

        default:

            return (
                <IdentityWorkspace
                    state={workspaceState}
                    actions={workspaceActions}
                />
            );

    }

}