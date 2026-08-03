import {
  WorkspaceSegmentedControl,
    WorkspaceSectionHeader,
} from "../../framework/Workspace";

export default function ProfileCapabilitySelector({
  values,
  setValue,
  readOnly = false,
}) {
  return (
    <section className="profile-capabilities">

      <div className="profile-capabilities-header">



      </div>

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
            label: "Person",
            value: "person",
        },
        {
            label: "Entity",
            value: "entity",
        },
    ]}

/>



    </section>
  );
}