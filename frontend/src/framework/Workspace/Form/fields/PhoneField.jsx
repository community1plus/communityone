import {
    DEFAULT_PHONE_COUNTRY,
    PHONE_COUNTRIES,
} from "../../../Workspace/profile/profileConstants";

import "../FieldRenderer.css";

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


    const value =
        form.getValue(name) ?? "";


    const selectedCountry =
        form.getValue("phoneCountry")
        || DEFAULT_PHONE_COUNTRY;


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


            {helperText && (

                <div className="workspace-field-helper">

                    {helperText}

                </div>

            )}

        </div>

    );

}