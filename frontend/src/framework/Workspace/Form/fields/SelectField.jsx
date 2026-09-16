import WorkspaceField
    from "../WorkspaceField";


export default function SelectField({

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

        helperText,

        readOnly = false,

        options = [],

    } = field;


    const value =
        form.getValue(name) ?? "";


    const selectedOption =
        options.find(
            option =>
                option.id === value
        );


    return (

        <WorkspaceField

            name={name}

            label={label}

            hint={helperText}

        >

            {editing ? (

                <select

                    id={name}

                    name={name}

                    className="workspace-field-select"

                    value={value}

                    disabled={readOnly}

                    onChange={
                        form.handleChange(name)
                    }

                    onBlur={
                        form.handleBlur(name)
                    }

                >

                    <option value="">

                        Select classification...

                    </option>


                    {options.map(option => (

                        <option

                            key={option.id}

                            value={option.id}

                        >

                            {option.label}

                        </option>

                    ))}

                </select>

            ) : (

                <div

                    id={name}

                    className="workspace-field-value"

                    role="textbox"

                    aria-readonly="true"

                >

                    {selectedOption?.label
                        || value
                        || "—"}

                </div>

            )}

        </WorkspaceField>

    );
//
}