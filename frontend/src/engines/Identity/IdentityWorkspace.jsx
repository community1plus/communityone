import {
    WorkspaceShell,
    WorkspaceWorkflow,
    WorkspaceContent,
    WorkspaceGuide,
} from "../../framework/Workspace";

import ProfileHelpPanel from "../../components/Profile/ProfileHelpPanel";
import ProfileCapabilitySelector from "../../components/Profile/ProfileCapabilitySelector";
import ProfileSectionTabs from "../../components/UI/ProfileSectionTabs";

export default function IdentityWorkspace() {

    return (

<WorkspaceShell>

<WorkspaceWorkflow>
            <ProfileCapabilitySelector
              values={values}
              setValue={form.setValue}
              readOnly={!editing}
            />
            <ProfileSectionTabs
              steps={activeSteps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
</WorkspaceWorkflow>

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