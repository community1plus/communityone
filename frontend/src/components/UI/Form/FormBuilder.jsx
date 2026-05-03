import Input from "./Input";
import Select from "./Select";
import Field from "./Field";

export default function FormBuilder({
  steps = [],
  currentStep = 0,
  form,
  extra = {},
}) {
  const {
    getValue,
    handleChange,
    handleBlur,
    getError,
    isValidating,
    isFieldValid,
  } = form;

  /* =========================
     SAFETY GUARD
  ========================= */

  const step = steps[currentStep];
  console.log("FORM BUILDER:", { steps, currentStep });

  if (!step || !Array.isArray(step.fields)) {
    console.warn("FormBuilder: invalid step config", {
      currentStep,
      steps,
    });
    return null;
  }

  /* =========================
     FIELD WRAPPER
  ========================= */

  const renderFieldWrapper = (field, input) => {
    const { name, label } = field;

    return (
      <Field
        key={name}
        label={label}
        error={getError(name)}
        loading={isValidating(name)}
        success={isFieldValid(name)}
      >
        {input}
      </Field>
    );
  };

  /* =========================
     FIELD TYPES
  ========================= */

  const renderInput = (field) => {
    const { name, readOnly } = field;

    return (
      <Input
        value={getValue(name)}
        onChange={handleChange(name, field)}
        onBlur={handleBlur(name, field)}
        readOnly={readOnly}
      />
    );
  };

  const renderSelect = (field) => {
    const { name, options = [] } = field;

    return (
      <Select
        value={getValue(name)}
        onChange={handleChange(name, field)}
        onBlur={handleBlur(name, field)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  };

  const renderLocation = (field) => {
    const { name } = field;

    const {
      Autocomplete,
      autoRef,
      onPlaceChanged,
      isLoaded,
    } = extra;

    if (!isLoaded || !Autocomplete) {
      return renderInput(field); // fallback
    }

    return (
      <Autocomplete
        onLoad={(auto) => (autoRef.current = auto)}
        onPlaceChanged={onPlaceChanged}
      >
        <Input
          value={getValue(name)?.label || ""}
          onChange={() => {}} // controlled by Google
          placeholder="Search for a location..."
        />
      </Autocomplete>
    );
  };

  /* =========================
     FIELD SWITCH
  ========================= */

  const renderField = (field) => {
    let input;

    switch (field.type) {
      case "select":
        input = renderSelect(field);
        break;

      case "location":
        input = renderLocation(field);
        break;

      case "text":
      default:
        input = renderInput(field);
        break;
    }

    return renderFieldWrapper(field, input);
  };

  /* =========================
     RENDER
  ========================= */

  return <>{step.fields.map(renderField)}</>;
}