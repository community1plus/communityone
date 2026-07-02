import {
    WorkspaceShell,
    WorkspaceNavigation,
    WorkspaceContent,
    WorkspaceGuide,
} from "../../framework/Workspace";

import ProfileHelpPanel from "../../components/Profile/ProfileHelpPanel";
import ProfileCapabilitySelector from "../../components/Profile/ProfileCapabilitySelector";
import ProfileSectionTabs from "../../components/UI/ProfileSectionTabs";

export default function IdentityWorkspace() {

    return (

        <WorkspaceShell>

<WorkspaceNavigation>
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