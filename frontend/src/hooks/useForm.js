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
        setTouchedState,
    ] = useState({});


    /* =========================
       SYNC INITIAL VALUES
    ========================= */

    useEffect(() => {

        setValues(
            initialValues
        );

        setErrors({});

        setTouchedState({});

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
        Boolean(
            getIn(
                touched,
                path
            )
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

            setTouchedState(
                previous =>
                    setIn(
                        previous,
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

    };

}