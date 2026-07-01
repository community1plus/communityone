import "./OrganisationProfileSection.css";

export default function OrganisationProfileSection({
    form,
    readOnly,
}) {

    const { values, setValue } = form;

    return (

        <div className="organisation-profile">

            <div className="organisation-field">

                <label>
                    Organisation Name
                </label>

                <input
                    type="text"
                    value={
                        values.organisation.name
                    }
                    readOnly={readOnly}
                    onChange={(e) =>
                        setValue(
                            "organisation.name",
                            e.target.value
                        )
                    }
                />

            </div>

        </div>

    );

}