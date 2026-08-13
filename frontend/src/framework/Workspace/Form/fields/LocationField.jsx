import { useRef } from "react";

import { Autocomplete } from "@react-google-maps/api";

import { useGoogleMaps }
    from "../../../../context/GoogleMapsProvider";

import "../FieldRenderer.css";


export default function LocationField({

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


    const autoRef =
        useRef(null);


    const {
        isLoaded,
    } = useGoogleMaps();


    const value =
        form.getValue(name);


    const isReadOnly =
        readOnly || !editing;


    const displayValue =
        typeof value === "string"
            ? value
            : value?.label ?? "";


    const handleLoad =
        (autocomplete) => {

            autoRef.current =
                autocomplete;

        };


    const handlePlaceChanged =
        () => {

            const place =
                autoRef.current?.getPlace();


            if (!place?.geometry) {
                return;
            }


            const countryComponent =
                place.address_components?.find(

                    component =>
                        component.types?.includes(
                            "country"
                        )

                );


            const countryCode =
                countryComponent
                    ?.short_name
                    ?.toUpperCase()
                || null;


            const country =
                countryComponent
                    ?.long_name
                || null;


            const location = {

                label:
                    place.formatted_address,

                fullAddress:
                    place.formatted_address,

                lat:
                    place.geometry.location.lat(),

                lng:
                    place.geometry.location.lng(),

                country,

                countryCode,

                type:
                    "manual",

                accuracy:
                    "MANUAL",

            };


            form.setValue(
                name,
                location
            );


            /* =====================================
               LOCATION → PHONE COUNTRY
            ===================================== */

            if (name === "homeLocation") {

                if (countryCode) {

                    form.setValue(

                        "phoneCountry",

                        countryCode

                    );

                }

            }

        };


    return (

        <div className="workspace-field">

            <label
                className="workspace-field-label"
                htmlFor={name}
            >

                {label}

            </label>


            {isLoaded && !isReadOnly ? (

                <Autocomplete

                    onLoad={
                        handleLoad
                    }

                    onPlaceChanged={
                        handlePlaceChanged
                    }

                >

                    <input

                        id={name}

                        name={name}

                        type="text"

                        className="workspace-field-input"

                        value={
                            displayValue
                        }

                        onChange={(event) => {

                            form.setValue(

                                name,

                                event.target.value

                            );

                        }}

                        onBlur={
                            form.handleBlur(name)
                        }

                        placeholder={
                            "Enter your home address"
                        }

                    />

                </Autocomplete>

            ) : (

                <input

                    id={name}

                    name={name}

                    type="text"

                    className="workspace-field-input"

                    value={
                        displayValue
                    }

                    readOnly={true}

                />

            )}


            {helperText && (

                <div className="workspace-field-helper">

                    {helperText}

                </div>

            )}

        </div>

    );

}