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

    if (!path) {
        return obj;
    }

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