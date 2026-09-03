import PhoneField from "./fields/PhoneField";
import LocationField from "./fields/LocationField";

import WorkspaceField
    from "./WorkspaceField";


export default function FieldRenderer({

    field,

    form,

    editing,

}) {

    if (!field) {
        return null;
    }


    /* =====================================================
       SPECIAL FIELD TYPES
    ===================================================== */

    switch (field.type) {

        case "location":

            return (

                <LocationField

                    field={field}

                    form={form}

                    editing={editing}

                />

            );


        case "phone":

            return (

                <PhoneField

                    field={field}

                    form={form}

                    editing={editing}

                />

            );


        default:

            break;

    }


    /* =====================================================
       FIELD CONFIGURATION
    ===================================================== */

    const {

        name,

        label,

        type = "text",

        helperText,

        readOnly = false,

    } = field;


    /* =====================================================
       VALUE
    ===================================================== */

    const value =
        form.getValue(name) ?? "";


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <WorkspaceField

            name={name}

            label={label}

            hint={helperText}

        >

            {editing ? (

                <input

                    id={name}

                    name={name}

                    type={type}

                    className="workspace-field-input"

                    value={value}

                    readOnly={readOnly}

                    onChange={
                        form.handleChange(name)
                    }

                    onBlur={
                        form.handleBlur(name)
                    }

                />

            ) : (

                <div

                    id={name}

                    className="workspace-field-value"

                    role="textbox"

                    aria-readonly="true"

                >

                    {value || "—"}

                </div>

            )}

        </WorkspaceField>

    );

}