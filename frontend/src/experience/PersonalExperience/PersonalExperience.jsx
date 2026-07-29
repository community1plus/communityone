import IdentityWorkspace from "../../engines/IdentityWorkspace/IdentityWorkspace";

export default function PersonalExperience({
    workspaceState,
    workspaceActions,
}) {

    return (
        <IdentityWorkspace
            state={workspaceState}
            actions={workspaceActions}
        />
    );

}