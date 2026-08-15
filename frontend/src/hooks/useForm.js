import {
    useState,
    useEffect,
} from "react";


/* =========================
   HELPERS
========================= */

function getIn(
    obj,
    path
) {

    return path
        .split(".")
        .reduce(
            (acc, key) =>
                acc?.[key],
            obj
        );

}


function setIn(
    obj,
    path,
    value
) {

    const keys =
        path.split(".");


    const next = {
        ...obj,
    };


    let curr =
        next;


    keys.forEach(
        (key, index) => {

            if (
                index ===
                keys.length - 1
            ) {

                curr[key] =
                    value;

            } else {

                curr[key] = {

                    ...(curr[key] || {}),

                };

                curr =
                    curr[key];

            }

        }
    );


    return next;

}


/* =========================
   REMOVE VALUE
========================= */

function deleteIn(
    obj,
    path
) {

    const keys =
        path.split(".");


    const next = {
        ...obj,
    };


    let curr =
        next;


    keys.forEach(
        (key, index) => {

            if (
                index ===
                keys.length - 1
            ) {

                delete curr[key];

                return;

            }


            if (
                !curr[key] ||
                typeof curr[key] !== "object"
            ) {

                return;

            }


            curr[key] = {

                ...curr[key],

            };


            curr =
                curr[key];

        }
    );


    return next;

}


/* =========================
   CLEAR VALUE
========================= */

function clearValue(
    value
) {

    if (
        typeof value ===
        "boolean"
    ) {

        return false;

    }


    if (
        Array.isArray(value)
    ) {

        return [];

    }


    if (
        value &&
        typeof value === "object"
    ) {

        return {};

    }


    return "";

}


/* =========================
   HOOK
========================= */

export default function useForm({

    initialValues = {},

}) {

    const [
        values,
        setValues,
    ] = useState(
        initialValues
    );


    useEffect(() => {

        setValues(
            initialValues
        );

    }, [
        initialValues,
    ]);


    const [
        errors,
        setErrors,
    ] = useState({});


    const [
        touched,
        setTouchedState,
    ] = useState({});


    /* =========================
       VALUE
    ========================= */

    const setValue = (

        path,

        value

    ) => {

        setValues(
            prev =>
                setIn(
                    prev,
                    path,
                    value
                )
        );

    };


    const getValue = (
        path
    ) =>
        getIn(
            values,
            path
        );


    /* =========================
       ERRORS
    ========================= */

    const getError = (
        path
    ) =>
        getIn(
            errors,
            path
        );


    /* =========================
       TOUCHED
    ========================= */

    const isTouched = (
        path
    ) =>
        !!getIn(
            touched,
            path
        );


    const isFieldValid = (
        path
    ) =>
        isTouched(path) &&
        !getError(path);


    /* =========================
       CHANGE
    ========================= */

    const handleChange =
        (path) => (e) => {

            const value =
                e?.target
                    ? e.target.value
                    : e;


            setValue(
                path,
                value
            );

        };


    /* =========================
       BLUR
    ========================= */

    const handleBlur =
        (path) => () => {

            setTouchedState(
                prev =>
                    setIn(
                        prev,
                        path,
                        true
                    )
            );

        };


    /* =========================
       RESET WHOLE FORM
    ========================= */

    const reset = () => {

        setValues(
            initialValues
        );

        setErrors({});

        setTouchedState({});

    };


    /* =========================
       RESET SECTION
    ========================= */

    const resetSection = (
        fields = []
    ) => {

        if (
            !Array.isArray(fields) ||
            fields.length === 0
        ) {

            return;

        }


        setValues(
            prev => {

                let next = {
                    ...prev,
                };


                fields.forEach(
                    field => {

                        if (
                            !field?.name
                        ) {

                            return;

                        }


                        const original =
                            getIn(
                                initialValues,
                                field.name
                            );


                        next =
                            setIn(
                                next,
                                field.name,
                                original
                            );

                    }
                );


                return next;

            }
        );


        /*
           Clear validation/touched
           state for this section.
        */

        setTouchedState(
            prev => {

                let next = {
                    ...prev,
                };


                fields.forEach(
                    field => {

                        if (
                            !field?.name
                        ) {

                            return;

                        }


                        next =
                            deleteIn(
                                next,
                                field.name
                            );

                    }
                );


                return next;

            }
        );


        setErrors(
            prev => {

                let next = {
                    ...prev,
                };


                fields.forEach(
                    field => {

                        if (
                            !field?.name
                        ) {

                            return;

                        }


                        next =
                            deleteIn(
                                next,
                                field.name
                            );

                    }
                );


                return next;

            }
        );

    };


    /* =========================
       CLEAR SECTION
    ========================= */

    const clearSection = (
        fields = []
    ) => {

        if (
            !Array.isArray(fields) ||
            fields.length === 0
        ) {

            return;

        }


        setValues(
            prev => {

                let next = {
                    ...prev,
                };


                fields.forEach(
                    field => {

                        if (
                            !field?.name
                        ) {

                            return;

                        }


                        const current =
                            getIn(
                                next,
                                field.name
                            );


                        next =
                            setIn(
                                next,
                                field.name,
                                clearValue(
                                    current
                                )
                            );

                    }
                );


                return next;

            }
        );


        /*
           Clear validation state
           after clearing fields.
        */

        setTouchedState(
            prev => {

                let next = {
                    ...prev,
                };


                fields.forEach(
                    field => {

                        if (
                            !field?.name
                        ) {

                            return;

                        }


                        next =
                            deleteIn(
                                next,
                                field.name
                            );

                    }
                );


                return next;

            }
        );


        setErrors(
            prev => {

                let next = {
                    ...prev,
                };


                fields.forEach(
                    field => {

                        if (
                            !field?.name
                        ) {

                            return;

                        }


                        next =
                            deleteIn(
                                next,
                                field.name
                            );

                    }
                );


                return next;

            }
        );

    };


    /* =========================
       STORAGE
    ========================= */

    const clearStorage = () => {};


    /* =========================
       API
    ========================= */

    return {

        values,

        errors,

        touched,


        setValues,

        setValue,


        handleChange,

        handleBlur,


        getValue,

        getError,


        isTouched,

        isFieldValid,


        reset,

        resetSection,

        clearSection,

        clearStorage,

    };

}