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

      <label className="profile-capability">

        <input
          type="checkbox"
          checked={values.capabilities?.personal ?? true}
          disabled={readOnly}
          onChange={(e) =>
            setValue(
              "capabilities.personal",
              e.target.checked
            )
          }
        />

        <span>Personal</span>

      </label>

      <label className="profile-capability">

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

        <span>Organisation</span>

      </label>

    </section>
  );
}