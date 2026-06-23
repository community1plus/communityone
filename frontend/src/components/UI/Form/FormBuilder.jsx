import Input from "./Input";
import Select from "./Select";
import Field from "./Field";

import StripePaymentWrapper from "../../../pages/StripePaymentWrapper";

export default function FormBuilder({
  steps = [],
  currentStep = 0,
  form,
  readOnly = false,
  extra = {},
}) {
  if (
    !Array.isArray(steps) ||
    steps.length === 0
  ) {
    return null;
  }

  const step = steps[currentStep];

  /* =========================================
     STRIPE PAYMENT STEP
  ========================================= */

  if (
    step?.customComponent ===
    "stripe-payment"
  ) {
    return (
      <div className="form-builder">
        <StripePaymentWrapper />
      </div>
    );
  }

  /* =========================================
     NORMAL FORM STEPS
  ========================================= */

  if (
    !step ||
    !Array.isArray(step.fields)
  ) {
    return null;
  }

  const {
    getValue,
    setValue,
    handleChange,
    handleBlur,
    getError,
    isFieldValid,
  } = form;

  const updateField = (
    name,
    value
  ) => {
    if (
      typeof setValue === "function"
    ) {
      setValue(name, value);
      return;
    }

    if (
      typeof handleChange ===
      "function"
    ) {
      handleChange(name, value);
    }
  };

  /* =========================================
     RENDER FIELD
  ========================================= */

  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      readOnly: fieldReadOnly = false,
      options = [],
      required = false,
    } = field;

    const disabled =
      readOnly || fieldReadOnly;

    const rawValue =
      getValue?.(name);

    const error =
      getError?.(name);

    const valid =
      isFieldValid?.(name);

    const fieldProps = {
      key: name,
      label,
      error,
      required,
      valid,
    };

    /* =========================================
       SELECT
    ========================================= */

    if (type === "select") {
      return (
        <Field {...fieldProps}>
          <Select
            name={name}
            value={rawValue ?? ""}
            options={options}
            disabled={disabled}
            onChange={(e) =>
              updateField(
                name,
                e.target.value
              )
            }
            onBlur={() =>
              handleBlur?.(name)
            }
          />
        </Field>
      );
    }

    /* =========================================
       LOCATION
    ========================================= */

    if (type === "location") {
      const {
        Autocomplete,
        autoRef,
        onPlaceChanged,
        isLoaded,
      } = extra;

      const displayValue =
        rawValue &&
        typeof rawValue === "object"
          ? rawValue.label ||
            rawValue.fullAddress ||
            ""
          : rawValue || "";

      return (
        <Field {...fieldProps}>
          {isLoaded &&
          Autocomplete ? (
            <Autocomplete
              onLoad={(ref) => {
                if (autoRef) {
                  autoRef.current =
                    ref;
                }
              }}
              onPlaceChanged={
                onPlaceChanged
              }
            >
              <Input
                name={name}
                value={displayValue}
                placeholder="Enter your home address"
                readOnly={disabled}
                disabled={disabled}
                autoComplete="off"
                onChange={(e) =>
                  updateField(
                    name,
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur?.(name)
                }
              />
            </Autocomplete>
          ) : (
            <Input
              name={name}
              value={displayValue}
              placeholder="Loading address search..."
              disabled
              readOnly
            />
          )}
        </Field>
      );
    }

    /* =========================================
       DEFAULT INPUT
    ========================================= */

    return (
      <Field {...fieldProps}>
        <Input
          name={name}
          type={type}
          value={rawValue ?? ""}
          readOnly={disabled}
          disabled={disabled}
          autoComplete={
            type === "tel"
              ? "new-password"
              : "off"
          }
          onChange={(e) =>
            updateField(
              name,
              e.target.value
            )
          }
          onBlur={() =>
            handleBlur?.(name)
          }
        />
      </Field>
    );
  };


  console.log("CURRENT STEP", step);
console.log("FIELDS", step.fields);

  return (
    <div className="form-builder">
      {step.fields.map(renderField)}
    </div>
  );
}