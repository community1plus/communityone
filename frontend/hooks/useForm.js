import { useState } from "react";

/* =========================
   HELPERS
========================= */

function getIn(obj, path) {
  return path
    .split(".")
    .reduce(
      (acc, key) => acc?.[key],
      obj
    );
}

function setIn(obj, path, value) {
  const keys = path.split(".");
  const next = { ...obj };

  let curr = next;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      curr[key] = value;
    } else {
      curr[key] = {
        ...(curr[key] || {}),
      };

      curr = curr[key];
    }
  });

  return next;
}

/* =========================
   HOOK
========================= */

export default function useForm({
  initialValues = {},
}) {
  const [values, setValues] =
    useState(initialValues);

  const [errors, setErrors] =
    useState({});

  const [touched, setTouchedState] =
    useState({});

  const setValue = (
    path,
    value
  ) => {
    setValues((prev) =>
      setIn(prev, path, value)
    );
  };

  const getValue = (path) =>
    getIn(values, path);

  const getError = (path) =>
    getIn(errors, path);

  const isTouched = (path) =>
    !!getIn(touched, path);

  const isFieldValid = (path) =>
    isTouched(path) &&
    !getError(path);

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

  const handleBlur =
    (path) => () => {

      setTouchedState(
        (prev) =>
          setIn(
            prev,
            path,
            true
          )
      );
    };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
  };

  const clearStorage = () => {};

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
    clearStorage,
  };
}