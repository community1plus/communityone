import {
    WorkspaceShell,
    WorkspaceNavigation,
    WorkspaceContent,
    WorkspaceGuide,
} from "../../framework/Workspace";

export default function IdentityWorkspace() {

    return (

        <WorkspaceShell>

            <WorkspaceNavigation>

            </WorkspaceNavigation>

            <WorkspaceContent>

            </WorkspaceContent>

<WorkspaceGuide>

    <ProfileHelpPanel
        section={activeSteps[currentStep]?.id}
    />

</WorkspaceGuide>

        </WorkspaceShell>

    );

}