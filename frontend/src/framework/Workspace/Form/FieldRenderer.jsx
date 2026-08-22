import PhoneField
    from "./fields/PhoneField";

import LocationField
    from "./fields/LocationField";

import "./FieldRenderer.css";


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


    const value = form.getValue(name) ?? "";


    /* =====================================================
       FIELD CONTENT
    ===================================================== */

    const content = editing ? (

        <input
            id={name}
            name={name}
            type={type}
            className="workspace-field-input"
            value={value}
            readOnly={readOnly}
            onChange={form.handleChange(name)}
            onBlur={form.handleBlur(name)}
        />

    ) : (

        <div
            className="workspace-field-value"
            id={name}
        >
            {value || "—"}
        </div>

    );


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="workspace-field">

            <label
                className="workspace-field-label"
                htmlFor={name}
            >
                {label}
            </label>


            <div className="workspace-field-content">

                {content}


                {helperText && (

                    <div className="workspace-field-helper">
                        {helperText}
                    </div>

                )}

            </div>

        </div>

    );

}