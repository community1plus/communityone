import Input from "./Input";
import Select from "./Select";
import Field from "./Field";

export default function FormBuilder({
  steps = [],
  currentStep = 0,
  form,
  extra = {},
}) {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const step = steps[currentStep];

  if (!step || !Array.isArray(step.fields)) return null;

  const {
    getValue,
    setValue,
    handleChange,
    handleBlur,
    getError,
    isFieldValid,
  } = form;

  const updateField = (name, value) => {
    if (typeof setValue === "function") {
      setValue(name, value);
      return;
    }

    if (typeof handleChange === "function") {
      handleChange(name, value);
    }
  };

  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      readOnly = false,
      options = [],
      required = false,
    } = field;

    const rawValue = getValue?.(name);
    const error = getError?.(name);
    const valid = isFieldValid?.(name);

    const fieldProps = {
      key: name,
      label,
      error,
      required,
      valid,
    };

    if (type === "select") {
      return (
        <Field {...fieldProps}>
          <Select
            name={name}
            value={rawValue ?? ""}
            options={options}
            disabled={readOnly}
            onChange={(e) => updateField(name, e.target.value)}
            onBlur={() => handleBlur?.(name)}
          />
        </Field>
      );
    }

    if (type === "location") {
      const { Autocomplete, autoRef, onPlaceChanged, isLoaded } = extra;

      const displayValue =
        rawValue && typeof rawValue === "object"
          ? rawValue.label || rawValue.fullAddress || ""
          : rawValue || "";

      return (
        <Field {...fieldProps}>
          {isLoaded && Autocomplete ? (
            <Autocomplete
              onLoad={(ref) => {
                if (autoRef) autoRef.current = ref;
              }}
              onPlaceChanged={onPlaceChanged}
            >
              <Input
                name={name}
                value={displayValue}
                placeholder="Enter your home address"
                readOnly={readOnly}
                disabled={readOnly}
                autoComplete="off"
                onChange={(e) => updateField(name, e.target.value)}
                onBlur={() => handleBlur?.(name)}
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

    return (
      <Field {...fieldProps}>
        <Input
          name={name}
          type={type}
          value={rawValue ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          autoComplete={type === "tel" ? "new-password" : "off"}
          onChange={(e) => updateField(name, e.target.value)}
          onBlur={() => handleBlur?.(name)}
        />
      </Field>
    );
  };

  return <div className="form-builder">{step.fields.map(renderField)}</div>;
}