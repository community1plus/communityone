import { useRef } from "react";

import { Autocomplete } from "@react-google-maps/api";

import { useGoogleMaps }
    from "../../../../context/GoogleMapsProvider";

import WorkspaceField
    from "../WorkspaceField";


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


    /* =====================================================
       AUTOCOMPLETE
    ===================================================== */

    const autoRef =
        useRef(null);


    const {
        isLoaded,
    } = useGoogleMaps();


    /* =====================================================
       VALUE
    ===================================================== */

    const value =
        form.getValue(name);


    const displayValue =
        typeof value === "string"

            ? value

            : value?.label ?? "";


    /* =====================================================
       READ ONLY
    ===================================================== */

    const isReadOnly =
        readOnly || !editing;


    /* =====================================================
       GOOGLE AUTOCOMPLETE
    ===================================================== */

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


            /* =============================================
               COUNTRY
            ============================================= */

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


            /* =============================================
               LOCATION MODEL
            ============================================= */

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


            /* =============================================
               SAVE LOCATION VALUE
            ============================================= */

            form.setValue(

                name,

                location

            );


            /* =============================================
               LOCATION → PHONE COUNTRY
            ============================================= */

            if (

                name === "homeLocation" &&

                countryCode

            ) {

                form.setValue(

                    "phoneCountry",

                    countryCode

                );

            }

        };


    /* =====================================================
       CONTROL
    ===================================================== */

    let control;


    if (!editing || readOnly) {

        control = (

            <div
                id={name}
                className="workspace-field-value"
            >

                {displayValue || "—"}

            </div>

        );

    } else {

        control = (

            isLoaded ? (

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

                        value={displayValue}

                        onChange={(event) => {

                            form.setValue(

                                name,

                                event.target.value

                            );

                        }}

                        onBlur={
                            form.handleBlur(name)
                        }

                        placeholder="Enter your home address"

                    />

                </Autocomplete>

            ) : (

                <input

                    id={name}

                    name={name}

                    type="text"

                    className="workspace-field-input"

                    value={displayValue}

                    readOnly={true}

                />

            )

        );

    }


    /* =====================================================
       FIELD
    ===================================================== */

    return (

        <WorkspaceField

            label={label}

            hint={helperText}

            htmlFor={name}

        >

            {control}

        </WorkspaceField>

    );

}