import PhoneField from "./fields/PhoneField";
import LocationField from "./fields/LocationField";

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


    /* =====================================================
       VALUE
    ===================================================== */

    const value =
        form.getValue(name) ?? "";


    /* =====================================================
       LABEL ID
       
       Used by view mode to associate the displayed
       value with its label.
    ===================================================== */

    const labelId =
        `${name}-label`;


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="workspace-field">


            {/* =================================================
               LABEL
            ================================================= */}

            {editing ? (

                <label
                    id={labelId}
                    className="workspace-field-label"
                    htmlFor={name}
                >
                    {label}
                </label>

            ) : (

                <div
                    id={labelId}
                    className="workspace-field-label"
                >
                    {label}
                </div>

            )}


            {/* =================================================
               FIELD CONTENT
            ================================================= */}

            <div className="workspace-field-content">


                {editing ? (

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
                        id={name}
                        className="workspace-field-value"
                        aria-labelledby={labelId}
                    >
                        {value || "—"}
                    </div>

                )}


                {/* =============================================
                   HELPER TEXT
                ============================================= */}

                {helperText && (

                    <div className="workspace-field-helper">
                        {helperText}
                    </div>

                )}

            </div>

        </div>

    );

}