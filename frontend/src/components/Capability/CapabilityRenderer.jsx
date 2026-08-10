export default function CapabilityRenderer({

    section,

    form,

    editing,

}) {

    if (!section) {

        return null;

    }

    if (section.view === "form") {

        return (

            <div>

                {section.fields?.map((field) => (

                    <div key={field.name}>

                        <label>
                            {field.label}
                        </label>

                        <input

                            type={field.type || "text"}

                            value={
                                form.values?.[field.name] ?? ""
                            }

                            readOnly={
                                field.readOnly || !editing
                            }

                            onChange={(event) =>
                                form.setValue(
                                    field.name,
                                    event.target.value
                                )
                            }

                        />

                    </div>

                ))}

            </div>

        );

    }

    return null;

}