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

        <input
          type="checkbox"
          checked={values.capabilities?.organisation ?? false}
          disabled={readOnly}
          onChange={(e) =>
            setValue(
              "capabilities.organisation",
              e.target.checked
            )
          }
        />

        <span>Organisation</span>

      </label>

    </section>
  );
}