import {
    useState,
    useEffect,
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
        (path) =>
        (event) => {

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
        (path) =>
        () => {

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


    /* =========================
       TOUCHED
    ========================= */

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
       
       Restores the form to the
       latest initial values.
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
       
       Clears the form completely.
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

        /* Values */

        values,

        setValues,

        setValue,

        getValue,


        /* Errors */

        errors,

        setErrors,

        getError,


        /* Touched */

        touched,

        setTouched,

        isTouched,

        isFieldValid,


        /* Events */

        handleChange,

        handleBlur,


        /* Actions */

        reset,

        clear,

    };

}