import {
    useState,
    useEffect,
} from "react";


/* =========================
   HELPERS
========================= */

import {
    useState,
    useEffect,
    useCallback,
} from "react";


/* =========================
   HELPERS
========================= */

function getIn(
    object,
    path
) {

    if (!path) {
        return object;
    }

    return path
        .split(".")
        .reduce(
            (current, key) =>
                current?.[key],
            object
        );

}


function setIn(
    object,
    path,
    value
) {

    if (!path) {
        return object;
    }

    const keys =
        path.split(".");

    const next = {
        ...object,
    };

    let current =
        next;

    keys.forEach(
        (key, index) => {

            if (
                index ===
                keys.length - 1
            ) {

                current[key] =
                    value;

                return;

            }

            current[key] = {

                ...(current[key] || {}),

            };

            current =
                current[key];

        }
    );

    return next;

}


/* =========================
   HOOK
========================= */

export default function useForm({

    initialValues = {},

}) {

    /* =========================
       STATE
    ========================= */

    const [
        values,
        setValues,
    ] = useState(
        initialValues
    );


    const [
        errors,
        setErrors,
    ] = useState({});


    const [
        touched,
        setTouched,
    ] = useState({});


    /* =========================
       INITIAL VALUE SYNC
    ========================= */

    useEffect(() => {

        setValues(
            initialValues
        );

        setErrors({});

        setTouched({});

    }, [
        initialValues,
    ]);


    /* =========================
       VALUE
    ========================= */

    const setValue =
        useCallback(

            (
                path,
                value
            ) => {

                setValues(
                    previous =>
                        setIn(
                            previous,
                            path,
                            value
                        )
                );

            },

            []

        );


    const getValue =
        useCallback(

            (path) => {

                return getIn(
                    values,
                    path
                );

            },

            [
                values,
            ]

        );


    /* =========================
       CHANGE
    ========================= */

    const handleChange =
        useCallback(

            (path) =>
                (event) => {

                    const value =
                        event?.target
                            ? event.target.value
                            : event;

                    setValues(
                        previous =>
                            setIn(
                                previous,
                                path,
                                value
                            )
                    );

                },

            []

        );


    /* =========================
       BLUR
    ========================= */

    const handleBlur =
        useCallback(

            (path) => () => {

                setTouched(
                    previous =>
                        setIn(
                            previous,
                            path,
                            true
                        )
                );

            },

            []

        );


    /* =========================
       ERRORS
    ========================= */

    const getError =
        useCallback(

            (path) => {

                return getIn(
                    errors,
                    path
                );

            },

            [
                errors,
            ]

        );


    /* =========================
       TOUCHED
    ========================= */

    const isTouched =
        useCallback(

            (path) => {

                return Boolean(
                    getIn(
                        touched,
                        path
                    )
                );

            },

            [
                touched,
            ]

        );


    const isFieldValid =
        useCallback(

            (path) => {

                return (
                    isTouched(path) &&
                    !getError(path)
                );

            },

            [
                isTouched,
                getError,
            ]

        );


    /* =========================
       RESET
    ========================= */

    const reset =
        useCallback(

            () => {

                setValues(
                    initialValues
                );

                setErrors({});

                setTouched({});

            },

            [
                initialValues,
            ]

        );


    /* =========================
       CLEAR
    ========================= */

    const clear =
        useCallback(

            () => {

                setValues({});

                setErrors({});

                setTouched({});

            },

            []

        );


    /* =========================
       RETURN
    ========================= */

    return {

        /* State */

        values,

        errors,

        touched,


        /* State setters */

        setValues,

        setErrors,

        setTouched,


        /* Values */

        setValue,

        getValue,


        /* Events */

        handleChange,

        handleBlur,


        /* Validation */

        getError,

        isTouched,

        isFieldValid,


        /* Form lifecycle */

        reset,

        clear,

    };

}

//

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


    let current =
        next;


    keys.forEach(
        (key, index) => {

            if (
                index ===
                keys.length - 1
            ) {

                current[key] =
                    value;

                return;

            }


            current[key] = {

                ...(current[key] || {}),

            };


            current =
                current[key];

        }
    );


    return next;

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


    const [
        errors,
        setErrors,
    ] = useState({});


    const [
        touched,
        setTouched,
    ] = useState({});


    /* =========================
       SYNC INITIAL VALUES
    ========================= */

    useEffect(() => {

        setValues(
            initialValues
        );

    }, [
        initialValues,
    ]);


    /* =========================
       VALUE
    ========================= */

    const setValue = (
        path,
        value
    ) => {

        setValues(
            previous =>
                setIn(
                    previous,
                    path,
                    value
                )
        );

    };


    const getValue = (
        path
    ) => {

        return getIn(
            values,
            path
        );

    };


    /* =========================
       CHANGE
    ========================= */

    const handleChange =
        (path) => (event) => {

            const value =
                event?.target
                    ? event.target.value
                    : event;


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

            setTouched(
                previous =>
                    setIn(
                        previous,
                        path,
                        true
                    )
            );

        };


    /* =========================
       ERRORS
    ========================= */

    const getError = (
        path
    ) => {

        return getIn(
            errors,
            path
        );

    };


    const isTouched = (
        path
    ) => {

        return Boolean(
            getIn(
                touched,
                path
            )
        );

    };


    const isFieldValid = (
        path
    ) => {

        return (
            isTouched(path) &&
            !getError(path)
        );

    };


    /* =========================
       RESET
    ========================= */

    const reset = () => {

        setValues(
            initialValues
        );

        setErrors({});

        setTouched({});

    };


    /* =========================
       CLEAR
    ========================= */

    const clear = () => {

        setValues({});

        setErrors({});

        setTouched({});

    };


    /* =========================
       RETURN
    ========================= */

    return {

        values,

        errors,

        touched,


        setValues,

        setValue,

        setErrors,

        setTouched,


        handleChange,

        handleBlur,


        getValue,

        getError,


        isTouched,

        isFieldValid,


        reset,

        clear,

    };

}