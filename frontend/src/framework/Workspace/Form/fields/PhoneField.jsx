import {
    DEFAULT_PHONE_COUNTRY,
    PHONE_COUNTRIES,
} from "../../../Workspace/profile/profileConstants";

import WorkspaceField
    from "../../../../framework/Workspace/.../WorkspaceField";


export default function PhoneField({

    field,

    form,

    editing,

}) {

    const {

        name,

        label,

        helperText,

        readOnly = false,

    } = field;


    /* =====================================================
       VALUE
    ===================================================== */

    const value =
        form.getValue(name) ?? "";


    /* =====================================================
       PHONE COUNTRY
    ===================================================== */

    const phoneCountry =
        form.getValue("phoneCountry");


    const selectedCountry =
        PHONE_COUNTRIES.some(

            country =>
                country.code === phoneCountry

        )

            ? phoneCountry

            : DEFAULT_PHONE_COUNTRY;


    /* =====================================================
       READ ONLY
    ===================================================== */

    const isReadOnly =
        readOnly || !editing;


    /* =====================================================
       FIELD
    ===================================================== */

    return (

        <WorkspaceField

            label={label}

            hint={helperText}

        >

            <div className="workspace-phone">

                <select

                    className="workspace-phone-country"

                    value={selectedCountry}

                    disabled={isReadOnly}

                    onChange={(event) => {

                        form.setValue(

                            "phoneCountry",

                            event.target.value

                        );

                    }}

                >

                    {PHONE_COUNTRIES.map(
                        (country) => (

                            <option
                                key={country.code}
                                value={country.code}
                            >

                                {country.code}
                                {" "}
                                {country.dialCode}

                            </option>

                        )
                    )}

                </select>


                <input

                    id={name}

                    name={name}

                    type="tel"

                    className="workspace-field-input"

                    value={value}

                    readOnly={isReadOnly}

                    onChange={
                        form.handleChange(name)
                    }

                    onBlur={
                        form.handleBlur(name)
                    }

                    placeholder="Enter your phone number"

                />

            </div>

        </WorkspaceField>

    );

}