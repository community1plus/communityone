import {
  WorkspaceSegmentedControl,
} from "../../framework/Workspace";

export default function ProfileCapabilitySelector({
  values,
  setValue,
  readOnly = false,
}) {
  return (
    <section className="profile-capabilities">

      <div className="profile-capabilities-header">

<WorkspaceSectionHeader

    title="Capabilities"

    description="Enable identity modes"

/>

<WorkspaceSegmentedControl

    value={
        values.capabilities?.organisation
            ? "organisation"
            : "personal"
    }

    onChange={(value) => {

        form.setValue(
            "capabilities.organisation",
            value === "organisation"
        );

    }}

    disabled={readOnly}

    options={[
        {
            label: "Personal",
            value: "personal",
        },
        {
            label: "Organisation",
            value: "organisation",
        },
    ]}

/>



    </section>
  );
}