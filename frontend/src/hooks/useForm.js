import { useState, useCallback, useRef } from "react";

/* =========================
   HELPERS
========================= */

const getIn = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

const setIn = (obj, path, value) => {
  const keys = path.split(".");
  const newObj = { ...obj };

  let curr = newObj;

  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      curr[key] = value;
    } else {
      curr[key] = { ...curr[key] };
      curr = curr[key];
    }
  });

  return newObj;
};

/* =========================
   DEBOUNCE
========================= */

const debounce = (fn, delay = 400) => {
  const timers = {};

  return (key, ...args) => {
    clearTimeout(timers[key]);
    timers[key] = setTimeout(() => fn(...args), delay);
  };
};

/* =========================
   HOOK
========================= */

export default function useForm({
  initialValues,
  validate,
  persistKey, // 🔥 optional autosave
}) {
  /* =========================
     PERSISTENCE
  ========================= */

  const load = () => {
    if (!persistKey) return null;
    try {
      return JSON.parse(localStorage.getItem(persistKey));
    } catch {
      return null;
    }
  };

  const save = (data) => {
    if (!persistKey) return;
    localStorage.setItem(persistKey, JSON.stringify(data));
  };

  const clearStorage = () => {
    if (!persistKey) return;
    localStorage.removeItem(persistKey);
  };

  const persisted = load();

  /* =========================
     STATE
  ========================= */

  const [values, setValues] = useState(
    persisted?.values || initialValues
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(
    persisted?.touched || {}
  );
  const [validating, setValidating] = useState({});

  const touchedRef = useRef(touched);
  touchedRef.current = touched;

  const validatingRef = useRef(validating);
  validatingRef.current = validating;

  const asyncRef = useRef({});
  const autosaveRef = useRef(null);

  /* =========================
     AUTOSAVE
  ========================= */

  const scheduleSave = (nextValues, nextTouched) => {
    if (!persistKey) return;

    clearTimeout(autosaveRef.current);

    autosaveRef.current = setTimeout(() => {
      save({ values: nextValues, touched: nextTouched });
    }, 500);
  };

  /* =========================
     VALIDATION
  ========================= */

  const runValidation = useCallback(
    (nextValues) => {
      if (!validate) return {};
      return validate(nextValues) || {};
    },
    [validate]
  );

  const validateField = (path, nextValues) => {
    if (!validate) return;

    const nextErrors = runValidation(nextValues);
    const fieldError = getIn(nextErrors, path);

    setErrors((prev) => setIn(prev, path, fieldError));
  };

  /* =========================
     ASYNC VALIDATION
  ========================= */

  const validateFieldAsync = async (
    path,
    value,
    fieldConfig,
    nextValues
  ) => {
    if (!fieldConfig?.validateAsync) return;

    const runId = Date.now();
    asyncRef.current[path] = runId;

    setValidating((prev) => setIn(prev, path, true));

    const error = await fieldConfig.validateAsync(value, nextValues);

    if (asyncRef.current[path] !== runId) return;

    setErrors((prev) => setIn(prev, path, error));
    setValidating((prev) => setIn(prev, path, false));
  };

  const debouncedAsync = useRef(
    debounce((path, value, fieldConfig, nextValues) => {
      validateFieldAsync(path, value, fieldConfig, nextValues);
    })
  ).current;

  /* =========================
     VALUE HANDLERS
  ========================= */

  const updateValue = (path, value, fieldConfig) => {
    setValues((prev) => {
      const next = setIn(prev, path, value);

      scheduleSave(next, touchedRef.current);

      if (getIn(touchedRef.current, path)) {
        validateField(path, next);

        if (fieldConfig?.validateAsync) {
          debouncedAsync(path, path, value, fieldConfig, next);
        }
      }

      return next;
    });
  };

  const setValue = updateValue;

  const handleChange = (path, fieldConfig) => (e) => {
    const value = e?.target ? e.target.value : e;
    updateValue(path, value, fieldConfig);
  };

  const handleBlur = (path, fieldConfig) => () => {
    setTouched((prev) => {
      const nextTouched = setIn(prev, path, true);
      touchedRef.current = nextTouched;

      scheduleSave(values, nextTouched);

      return nextTouched;
    });

    setValues((prev) => {
      validateField(path, prev);

      if (fieldConfig?.validateAsync) {
        const value = getIn(prev, path);
        validateFieldAsync(path, value, fieldConfig, prev);
      }

      return prev;
    });
  };

  /* =========================
     VALIDATE ALL
  ========================= */

  const validateAll = async () => {
    const nextErrors = runValidation(values);
    setErrors(nextErrors);

    // wait for async validations (safe)
    await new Promise((resolve) => {
      const check = () => {
        if (!Object.values(validatingRef.current).some(Boolean)) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });

    return (
      Object.keys(nextErrors).length === 0 &&
      !Object.values(validatingRef.current).some(Boolean)
    );
  };

  /* =========================
     HELPERS
  ========================= */

  const getError = (path) => getIn(errors, path);
  const getValue = (path) => getIn(values, path);
  const isTouched = (path) => !!getIn(touched, path);
  const isValidating = (path) => !!getIn(validating, path);

  const isFieldValid = (path) =>
    isTouched(path) && !getError(path) && !isValidating(path);

  const isFormValidating = Object.values(validating).some(Boolean);

  const isValid =
    Object.keys(errors).length === 0 && !isFormValidating;

  /* =========================
     RESET
  ========================= */

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setValidating({});
    clearStorage();
  };

  /* =========================
     RETURN
  ========================= */

  return {
    values,
    errors,
    touched,
    validating,

    setValue,
    setValues,

    handleChange,
    handleBlur,

    validateAll,
    validateField,

    reset,

    // helpers
    getError,
    getValue,
    isTouched,
    isValid,
    isValidating,
    isFormValidating,
    isFieldValid,

    // manual control
    setError: (path, v) =>
      setErrors((prev) => setIn(prev, path, v)),
    setTouched: (path, v = true) =>
      setTouched((prev) => setIn(prev, path, v)),

    clearStorage,
  };
}