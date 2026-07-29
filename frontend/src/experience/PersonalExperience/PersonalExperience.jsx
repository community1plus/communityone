import { useState } from "react";

import PersonalExperience
from "../../experience/PersonalExperience/PersonalExperience";
import WalletWorkspace from "../../capabilities/Wallet/WalletWorkspace";

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