import Input from "./Input";
import Select from "./Select";
import Field from "./Field";

export default function FormBuilder({
  steps = [],
  currentStep = 0,
  form,
  extra = {},
}) {
  if (!Array.isArray(steps) || steps.length === 0) {
    console.warn("FormBuilder: invalid steps array", steps);
    return null;
  }

  const step = steps[currentStep];

  if (!step || !Array.isArray(step.fields)) {
    console.warn("FormBuilder: invalid step config", {
      currentStep,
      steps,
      step,
    });
    return null;
  }

  if (!form) {
    console.warn("FormBuilder: missing form object");
    return null;
  }

  const { getValue, handleChange, handleBlur, getError, isFieldValid } = form;

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
            onChange={(e) => handleChange?.(name, e.target.value)}
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
                onChange={(e) => handleChange?.(name, e.target.value)}
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
          onChange={(e) => handleChange?.(name, e.target.value)}
          onBlur={() => handleBlur?.(name)}
        />
      </Field>
    );
  };

  return <div className="form-builder">{step.fields.map(renderField)}</div>;
}