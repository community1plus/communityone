import Input from "./Input";
import Select from "./Select";
import Field from "./Field";

export default function FormBuilder({
  steps = [],
  currentStep = 0,
  form,
  extra = {},
}) {
  if (!Array.isArray(steps)) {
    console.warn("FormBuilder expected steps array but received:", steps);
    return null;
  }

  if (!steps.length) {
    console.warn("FormBuilder: empty steps array");
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

  const {
    getValue,
    handleChange,
    handleBlur,
    getError,
    isValidating,
    isFieldValid,
  } = form;

  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      readOnly = false,
      options = [],
      required = false,
    } = field;

    const value = getValue(name) ?? "";
    const error = getError(name);
    const valid = isFieldValid?.(name);

    if (type === "select") {
      return (
        <Field
          key={name}
          label={label}
          error={error}
          required={required}
          valid={valid}
        >
          <Select
            name={name}
            value={value}
            options={options}
            disabled={readOnly || isValidating}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
          />
        </Field>
      );
    }

    if (type === "location") {
      const { Autocomplete, autoRef, onPlaceChanged, isLoaded } = extra;

      return (
        <Field
          key={name}
          label={label}
          error={error}
          required={required}
          valid={valid}
        >
          {isLoaded && Autocomplete ? (
            <Autocomplete
              onLoad={(ref) => {
                autoRef.current = ref;
              }}
              onPlaceChanged={onPlaceChanged}
            >
              <Input
                name={name}
                value={value?.label || value?.fullAddress || ""}
                placeholder="Enter your home address"
                disabled={readOnly || isValidating}
                onChange={(e) => handleChange(name, e.target.value)}
                onBlur={() => handleBlur(name)}
              />
            </Autocomplete>
          ) : (
            <Input
              name={name}
              value={value?.label || value?.fullAddress || ""}
              placeholder="Loading address search..."
              disabled
            />
          )}
        </Field>
      );
    }

    return (
      <Field
        key={name}
        label={label}
        error={error}
        required={required}
        valid={valid}
      >
        <Input
          name={name}
          type={type}
          value={value}
          readOnly={readOnly}
          disabled={readOnly || isValidating}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
        />
      </Field>
    );
  };

  return <div className="form-builder">{step.fields.map(renderField)}</div>;
}