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

        <h3>Capabilities</h3>

        <p>
          Select how you will use Community One.
          You can enable both at any time.
        </p>

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