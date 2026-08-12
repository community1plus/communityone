import "./FieldRenderer.css";

export default function FieldRenderer({

    field,

    form,

    editing,

}) {

    if (!field) {
        return null;
    }


    const {

        name,

        label,

        type = "text",

        helperText,

        readOnly = false,

    } = field;


    const value =
        form.getValue(name) ?? "";


    const isReadOnly =
        readOnly || !editing;


    /* =====================================
       LOCATION
    ===================================== */

    if (type === "location") {

        return (

            <div className="workspace-field">

                <label
                    className="workspace-field-label"
                    htmlFor={name}
                >

                    {label}

                </label>


                <input

                    id={name}

                    name={name}

                    type="text"

                    className="workspace-field-input"

                    value={value}

                    readOnly={isReadOnly}

                    onChange={
                        form.handleChange(name)
                    }

                    onBlur={
                        form.handleBlur(name)
                    }

                    placeholder="Enter your home address"

                />


                {helperText && (

                    <div className="workspace-field-helper">

                        {helperText}

                    </div>

                )}

            </div>

        );

    }


    /* =====================================
       STANDARD FIELD
    ===================================== */

    return (

        <div className="workspace-field">

            <label
                className="workspace-field-label"
                htmlFor={name}
            >

                {label}

            </label>


            <input

                id={name}

                name={name}

                type={type}

                className="workspace-field-input"

                value={value}

                readOnly={isReadOnly}

                onChange={
                    form.handleChange(name)
                }

                onBlur={
                    form.handleBlur(name)
                }

            />


            {helperText && (

                <div className="workspace-field-helper">

                    {helperText}

                </div>

            )}

        </div>

    );

}