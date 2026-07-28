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

import WalletActions from "../../components/Wallet/WalletActions";
import WalletHelpPanel from "../../components/Wallet/WalletHelpPanel";
import WalletSectionRenderer from "./sections/WalletSectionRenderer";

import { buildWalletWorkspace } from "../../experience/workspace/builders/buildWalletWorkspace";

export default function WalletWorkspace() {

    const [currentSection, setCurrentSection] =
        useState("overview");

    const sections = [
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

    const workspace = buildWalletWorkspace({

        currentSection,

        setCurrentSection,

        sections,

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
                        section={currentSection}
                    />

                </WorkspaceBody>

            </WorkspaceMain>

            <WorkspaceSidebar>

                <WorkspaceGuide>

                    <WalletHelpPanel
                        section={currentSection}
                    />

                </WorkspaceGuide>

                <WorkspaceActions>

                    <WalletActions />

                </WorkspaceActions>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}