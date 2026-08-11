export default function IdentitySection({

    section,

    form,

    editing,

}) {

    if (!section) {

        return null;

    }


    const {
        fields = [],
    } = section;


    return (

        <div className="identity-section">

            {fields.map((field) => {

                const value =
                    form.getValue(field.name) ?? "";


                const readOnly =
                    field.readOnly ||
                    !editing;


                return (

                    <div
                        key={field.name}
                        className="identity-field"
                    >

                        <label
                            htmlFor={field.name}
                        >

                            {field.label}

                        </label>


                        <input

                            id={field.name}

                            name={field.name}

                            type={field.type || "text"}

                            value={value}

                            readOnly={readOnly}

                            onChange={
                                form.handleChange(
                                    field.name
                                )
                            }

                            onBlur={
                                form.handleBlur(
                                    field.name
                                )
                            }

                        />


                        {field.helperText && (

                            <div className="identity-field-helper">

                                {field.helperText}

                            </div>

                        )}

                    </div>

                );

            })}

        </div>

    );

}