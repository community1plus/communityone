import { useState } from "react";

import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceSidebar,
    WorkspaceHeader,
    WorkspaceRegionHeader,
    WorkspaceWorkflow,
    WorkspaceProgress,
    WorkspaceBody,
    WorkspaceGuide,
    WorkspaceActions,
    WorkspaceTabs,
} from "../../framework/Workspace";

import WalletActions from "./WalletActions";
import WalletHelpPanel from "./WalletHelpPanel";
import WalletSectionRenderer from "../sections/WalletSectionRenderer";

import { buildWalletWorkspace } from "../../experience/workspace/builders/buildWalletWorkspace";

const walletSections = [
    {
        value: "overview",
        label: "Overview",
    },
    {
        value: "accounts",
        label: "Accounts",
    },
    {
        value: "transactions",
        label: "Transactions",
    },
    {
        value: "settings",
        label: "Settings",
    },
];

export default function WalletWorkspace() {

    const [activeSection, setActiveSection] =
        useState(walletSections[0].value);

    const workspace = buildWalletWorkspace({

        activeSection,

        setActiveSection,

        sections: walletSections,

    });

    return (

        <WorkspaceShell>

            <WorkspaceMain>

                <WorkspaceRegionHeader>

                    <WorkspaceHeader
                        model={workspace.header}
                    />

                </WorkspaceRegionHeader>

                <WorkspaceWorkflow>

                    <WorkspaceTabs
                        model={workspace.sections}
                    />

                </WorkspaceWorkflow>

                <WorkspaceProgress
                    model={workspace.progress}
                />

                <WorkspaceBody>

                    <WalletSectionRenderer
                        section={activeSection}
                    />

                </WorkspaceBody>

            </WorkspaceMain>

            <WorkspaceSidebar>

                <WorkspaceGuide>

                    <WalletHelpPanel
                        section={activeSection}
                    />

                </WorkspaceGuide>

                <WorkspaceActions>

                    <WalletActions />

                </WorkspaceActions>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}