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